const loader = document.querySelector("#loader");
const content = document.querySelector("#bubble-chart");
// Load-time Measurements
// Before I make any performance improvements: Approx. 7579 - 9979 milliseconds
// After locally-scoping unnecessary const variables:

addEventListener("DOMContentLoaded", async (event) => {
	// Timer Reference: https://techblog.constantcontact.com/software-development/measure-page-load-times-using-the-user-timing-api/

	// Toggling the loading icon display, hiding it when the data is loaded.
	loader.style.display = "block";

	// Loading the data and timing how long it takes to load.
	let startTime = window.performance.now();
	const dataLoaded = await fetchData();
	let endTime = window.performance.now();

	console.log(
		"Loading the chart took " + (endTime - startTime) + " milliseconds."
	);

	loader.style.display = "none";
});

function fetchData() {
	return new Promise(async (resolve) => {
		await bubbleChart();
		resolve();
	});
}

async function bubbleChart() {
	// Here is where we call our logic functions that fetch and format the data behind the scenes.
	const data = await main();

	// Tutorial Credit: https://www.webtips.dev/how-to-make-interactive-bubble-charts-in-d3-js

	// Bubble chart config
	const width = window.innerWidth;
	const height = window.innerHeight;
	const colors = {
		html: "#F16529",
		css: "#1C88C7",
		js: "#FCC700",
		"": "rgb(0, 178, 133)",
	};

	// Bubble chart generation
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

	// Calling the bubble chart generation function and passing my data to it.
	generateChart(data);
}

async function main() {
	// Get post data from r/ProgrammerHumor.json
	const subredditData = await getSubredditData();

	// Get unique authors from subreddit posts
	const uniqueAuthors = getSubredditAuthors(subredditData);

	// Fetch user activity from each unique author's profile
	const userActivity = await getUserActivity(uniqueAuthors);

	/*
	Format user activity data into an array of objects that can be easily counted. 
	NSFW posts are also removed at this step. (This is a school project, after all...)
	
		Format: {subreddit: subreddit, username: username, type: type }
	*/
	const formattedActivity = formatUserActivity(userActivity);

	/*
	Remove duplicate entries (i.e. if a user has commented on a post and then posted to
	the same subreddit), as to not skew the data. 
	
	In the future (past the scope of the project in the current time-frame) I intend
	separate the data into two separate arrays, one for comments and one for posts, and
	then display them on separate graphs or show the individual post/comment count on
	hover.
	*/
	const dupesRemoved = removeDuplicates(formattedActivity);
	console.log("calling dupesRemoved: ", dupesRemoved);

	/*
	Count and format data into an array of objects that can be used to create the bubble
	chart.' Category is left empty at this time, but one day I intend to add a feature
	that will utilize it. (In d3, category is used to color the bubbles, so I'm hoping in
	the future I can find a way to color them based on the type of subreddit they are
	(tech, gaming, memes, etc.) but I'm not sure where I'd get that data from yet.)

		Format: {name: subreddit, category: "", score: count}
	*/
	const dataPoints = formatDataPoint(dupesRemoved);

	/*
	We return the dataPoints array so that we can use it in the bubble chart function.
	This function is called inside the bubble chart generation function.
	*/
	return dataPoints;
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

		console.log("BEFORE NSFW REMOVAL:", obj);

		// Filter out data from NSFW subreddits
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

function removeNSFW(obj) {
	const filteredData = obj.rawUserActivity.filter(checkNSFW);

	function checkNSFW(post) {
		if (post.data.over_18) console.log("NSFW POST:", post);
		return post.data.over_18 === false;
	}

	return filteredData;
}

function removeDuplicates(arr) {
	/**
	 * Returns an array of objects with no duplicates
	 * @param {Array} arr Array of Objects
	 * @param {Array} keyProps Array of keys to determine uniqueness
	 */
	// Remove duplicates (I'm not interested in how much they've posted in each subreddit
	// at this time, I just want to find out which subreddits they've posted/commented in)

	// !IDEA: Later when counting I can individually count each comment/post and them add
	// them together for the total. I can create a commentCount and postCount and use a
	// simple if statement to add to each one depending on if type = t1/t3

	// For the first stage of this project I'm not going to focus on whether or not the
	// activity was a post or comment, so for now, if a user has both posted and commented
	// in a subreddit, whichever is less recent will be removed as a duplicate. Although
	// I'm not using the 'type' attribute yet, I'm going to keep it in the object for now,
	// so later I can come back to this code and add the functionality to count posts and
	// comments separately.

	// !REFERENCE: https://www.adamdehaven.com/blog/how-to-remove-duplicate-objects-from-a-javascript-array/#usage-example
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
	// Counting Reference: https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements

	let counts = {};
	for (const data of dataArr) {
		counts[data.subreddit] = counts[data.subreddit]
			? counts[data.subreddit] + 1
			: 1;
	}

	let dataPoints = [];

	for (const property in counts) {
		let singleDataPoint = {
			name: property,
			category: "",
			score: counts[property],
		};
		dataPoints.push(singleDataPoint);
	}

	console.log("counts", counts);
	console.log("dataPoints", dataPoints);
	return dataPoints;
}
