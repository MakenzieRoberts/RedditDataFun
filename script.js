// const feedDisplay = document.querySelector("#feed");

// main();
// const fetchButton = document.querySelector("#fetchButton");
const loader = document.querySelector("#loader");
const content = document.querySelector("#bubble-chart");
addEventListener("DOMContentLoaded", async (event) => {
	// fetchButton.onclick = async function () {
	console.log(loader);
	// content.innerHTML = "";

	// Your loader styling, mine is just text that I display and hide
	loader.style.display = "block";
	const nextContent = await fetchData();
	loader.style.display = "none";

	// content.innerHTML = nextContent;
});

// Write a new promise

function fetchData() {
	return new Promise(async (resolve) => {
		await bubbleChart();
		resolve();
	});
}

// bubbleChart();
async function bubbleChart() {
	let myData = await main();

	let data = myData;

	// const file = cat;
	const width = window.innerWidth;
	const height = window.innerHeight;
	const colors = {
		html: "#F16529",
		css: "#1C88C7",
		js: "#FCC700",
		"": "rgb(0, 178, 133)",
	};

	const generateChart = (data) => {
		const bubble = (data) =>
			d3.pack().size([width, height]).padding(2)(
				d3.hierarchy({ children: data }).sum((d) => (d.score / 2) * 5)
			);

		const svg = d3
			.select("#bubble-chart")
			.style("width", width)
			.style("height", height);

		const root = bubble(data);
		const tooltip = d3.select(".tooltip");

		const node = svg
			.selectAll()
			.data(root.children)
			.enter()
			.append("g")
			.attr("transform", `translate(${width / 2}, ${height / 2})`);

		const circle = node
			.append("circle")
			.style("fill", (d) => colors[d.data.category])
			.on("mouseover", function (e, d) {
				tooltip.select("img").attr("src", d.data.img);
				tooltip
					.select("a")
					.attr("href", "https://www.reddit.com/r/" + d.data.name)
					.text(d.data.name);
				tooltip
					.select("span")
					.attr("class", d.data.category)
					.text(d.data.category);
				tooltip.style("visibility", "visible");

				d3.select(this).style("stroke", "#222");
			})
			.on("mousemove", (e) =>
				tooltip.style("top", `${e.pageY}px`).style("left", `${e.pageX + 10}px`)
			)
			.on("mouseout", function () {
				d3.select(this).style("stroke", "none");
				return tooltip.style("visibility", "hidden");
			})
			.on("click", (e, d) =>
				window.open("https://www.reddit.com/r/" + d.data.name)
			);

		const label = node
			.append("text")
			.attr("dy", 2)
			.text((d) => d.data.name);

		node
			.transition()
			.ease(d3.easeExpInOut)
			.duration(1000)
			.attr("transform", (d) => `translate(${d.x}, ${d.y})`);

		circle
			.transition()
			.ease(d3.easeExpInOut)
			.duration(1000)
			.attr("r", (d) => d.r);

		label
			.transition()
			.delay(700)
			.ease(d3.easeExpInOut)
			.duration(1000)
			.style("opacity", 1);
	};

	generateChart(data);
}

async function main() {
	const subredditData = await getSubredditData();
	const uniqueAuthors = getSubredditAuthors(subredditData);
	const userActivity = await getUserActivity(uniqueAuthors);

	// const userSubreddits = getUserSubreddits(userActivity);

	// {subreddit: "subreddit", username: "username", type: "type" }
	const formattedActivity = formatUserActivity(userActivity);
	const dupesRemoved = removeDuplicates(formattedActivity);
	console.log("calling dupesRemoved: ", dupesRemoved);
	const dataPoints = formatDataPoint(dupesRemoved);
	return dataPoints;
	// module.exports = { dataPoints };
	//---
	// const userSubredditsCount = countUserSubreddits(userSubreddits);
	// console.log(userSubredditsCount);
	//
	// const userSubreddits = await getPostSubreddits(userActivity); // i dont think i need await here
	// console.log("user subreddits(filtered)", userSubreddits);
}

async function getSubredditData() {
	const data = await fetch("https://www.reddit.com/r/ProgrammerHumor.json")
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
	// console.log(data);

	return data;
}

function getSubredditAuthors(data) {
	const authors = data.data.children.map((post) => post.data.author);
	// Only get unique authors
	const uniqueAuthors = Array.from([...new Set(authors)]);
	// console.log("unique authors", uniqueAuthors);
	return uniqueAuthors;
}

// (?) Does this function need to be async? does the foreach need to be async?
async function getUserActivity(uniqueAuthors) {
	//      Description:    Fetch's user data and extracts the posts. Then creates a new
	//                      object containing the username and their posts, and returns it.

	//      Parameter:      uniqueAuthors - array of unique authors

	//      Returns:         Sends back an object containing the user and their posts

	// !IMPORTANT Make sure to only get subreddits where the user has posted, not comments. another function will handle comments (f1/f3)

	// For each post's author in the target subreddit, go to their profile and get their posts and extract the names of each subreddit they've posted in
	// !IMPORTANT Make sure to only get subreddits where the user has posted, not comments. another function will handle comments
	// !IMPORTANT Remember to put .CATCH statements in each fetch request!!
	// !IMPORTANT I might be able to do multiple pages instead of getting just 25 results, we'll see. (also did user posts go from 26 ot 25? check how many posts are sent back)
	let testing = [];

	const allAsyncResults = [];

	for (const item of uniqueAuthors) {
		const asyncResult = await fetch(
			`https://www.reddit.com/user/${item}.json`
		).then((response) => response.json());
		allAsyncResults.push({
			user: item,
			rawUserActivity: asyncResult.data.children,
		});
	}

	return allAsyncResults;
}

// Q: whats the difference between foreach and map?

function formatUserActivity(userActivity) {
	/*
	[ 
		0:
		{
			user: "_unsusceptible",
			rawUserActivity: [
				{
					kind: "t1",
					data: {
						subreddit_id: "t5_2tex6",
					},
				},
			],
		},
	];
	*/
	// This function will get subreddits that user has posted/commented in. Later I'll make the function that filters out one or the other using the t1/t3 values
	let userSubreddits = [];
	console.log({ userActivity });

	userActivity.forEach((obj) => {
		let user = obj.user;
		// let filtered = removeNSFW(obj.rawUserActivity);
		console.log("BEFORE NSFW REMOVAL:", obj);

		// filter out data from nsfw subreddits
		const subredditData = removeNSFW(obj);

		subredditData.forEach((post) => {
			let dataObj = {
				subreddit: post.data.subreddit,
				username: user,
				type: post.kind,
			};
			userSubreddits.push(dataObj);
		});
	});
	console.log("user subreddits", userSubreddits);

	return userSubreddits;
}

function removeDuplicates(arr) {
	// Remove duplicates (I'm not interested in how much they've posted in each subreddit at this time, I just want to find out which subreddits they've posted/commented in)

	// !IDEA: Later when counting I can individually count each comment/post and them add them together for the total. I can create a commentCount and postCount and use a simple if statement to add to each one depending on if type = t1/t3
	// !REFERENCE: https://www.adamdehaven.com/blog/how-to-remove-duplicate-objects-from-a-javascript-array/#usage-example
	/**
	 * Returns an array of objects with no duplicates
	 * @param {Array} arr Array of Objects
	 * @param {Array} keyProps Array of keys to determine uniqueness
	 */
	function getUniqueArray(arr, keyProps) {
		return Object.values(
			arr.reduce((uniqueMap, entry) => {
				const key = keyProps.map((k) => entry[k]).join("|");
				if (!(key in uniqueMap)) uniqueMap[key] = entry;
				return uniqueMap;
			}, {})
		);
	}

	const unique = getUniqueArray(arr, ["subreddit", "username", "type"]);

	return unique;
}

function formatDataPoint(dataArr) {
	// !REFERENCE: https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
	// Things i need to do
	// 1. Count how many times each subreddit appears, (two counts 1 for comments 1 for posts) add them together and store that number in a variable
	// 2. Each data point represents one subreddit.. so.. for every 'new' subreddit it comes across while iterating, it should check if a data point for it already exists and create a new one if it doesn't

	// let link = "https://www.reddit.com/r/" + subreddit;
	// let dataPointArray = [];
	// let singleDataPoint = {
	// 	name: subreddit,
	// 	category: username,
	// 	score: count,
	// 	link: link,
	// };

	// const arr = [5, 5, 5, 2, 2, 2, 2, 2, 9, 4];

	// t1 for comment
	// t3 for post
	//--- separate t1/t3
	// let commentCounts = {};
	// let postCounts = {};

	// for (const num of dupesRemoved) {
	// 	if (num.type === "t1") {
	// 		commentCounts[num.subreddit] = commentCounts[num.subreddit]
	// 			? commentCounts[num.subreddit] + 1
	// 			: 1;
	// 	} else if (num.type === "t3") {
	// 		postCounts[num.subreddit] = postCounts[num.subreddit]
	// 			? postCounts[num.subreddit] + 1
	// 			: 1;
	// 	}
	// }
	let counts = {};
	for (const data of dataArr) {
		counts[data.subreddit] = counts[data.subreddit]
			? counts[data.subreddit] + 1
			: 1;
	}

	let dataPoints = [];
	// for (const property in object) {
	// 	let singleDataPoint = {
	// 		name: Object.keys(count),
	// 		category: "",
	// 		score: count[count],
	// 	};
	// 	dataPoints.push(singleDataPoint);
	// }
	// console.log("commentCounts", commentCounts);
	// console.log("postCounts", postCounts);

	// //--
	// const object = { a: 1, b: 2, c: 3 };

	for (const property in counts) {
		let singleDataPoint = {
			name: property,
			category: "",
			score: counts[property],
		};
		dataPoints.push(singleDataPoint);
		// console.log(`${property}: ${object[property]}`);
	}

	console.log("counts", counts);
	console.log("dataPoints", dataPoints);
	return dataPoints;
}

function removeNSFW(obj) {
	let filteredData = obj.rawUserActivity.filter(checkNSFW);

	function checkNSFW(post) {
		if (post.data.over_18) console.log("NSFW POST:", post);
		return post.data.over_18 === false;
	}

	return filteredData;
}

function createDataObject() {
	let postdata = {
		data: [],
	};

	let userActivityObj = new Object({
		user: user,
		posts: JSON.stringify(userData.data.children),
	});
	postdata.data.push(userActivityObj);
}

/*
async function getPostSubreddits(userActivity) {
	// Description:    Extracts the subreddit name from each post and returns an array of unique subreddits

	// Parameter:      userActivity - object containing the user and their posts

	// Returns:        Array(?) of unique subreddits
	console.log("getPostSubreddits() userActivity: ", userActivity);

	// const getSubreddits = (item) => console.log(item);
	// const subreddits = userActivity.map(getSubreddits);

	// console.log("subreddits:", subreddits);
	const test = [];
	userActivity.forEach((element) => {
		let posts = element.posts;
		console.log(posts);
	});
	// console.log("test", test);
	// This foreach function will loop through each post of a user and get the subreddit name for each post
	// ! Not working with the new object i made. hm. its working in foreach.js but with the object i created in foreach.js it doesnt work. maybe just use a regular old array of objects instead, with no name for the object

	// userActivity.forEach(function (i) {
	// 	console.log(i);
	// 	const subreddits = userActivity.userActivity.map((post) => post.data.subreddit);
	// 	console.log("SUBREDDITS", subreddits);
	// 	//---
	// 	// Use set to elimate duplicates, then convert back to an array
	// 	// const uniqueSubreddits = Array.from([...new Set(subreddits)]);
	// 	// console.log(`user: ${user}, subreddits: ${uniqueSubreddits}`);
	// 	// const userSubredditsObj = {
	// 	// 	user: user,
	// 	// 	postSubreddits: uniqueSubreddits,
	// 	// };
	// 	//----
	// 	// console.log(userSubredditsObj);
	// 	// userActivity.forEach((post) => {
	// 	// 	console.log(post.data.subreddit);
	// 	//     const subreddit = post.data.subreddit;
	// 	// 	const uniqueAuthors = Array.from([...new Set(authors)]);
	// 	// });
	// });
}
*/
// (async () => {
// 	// bunch of irrelevant code here

// 	// gets all URLs, formatted & store in this variable
// 	const dataPoints = formatDataPoint(dupesRemoved);
// 	module.exports = { availableFormattedUrls };
// })();

// // module.exports = (async () => {
// // 	return dataPoints;
// // })();
// // export default async () => {
// // 	return await main();
// // };

// export default = { main };

// export default await main();
