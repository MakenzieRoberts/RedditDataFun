// Author: 			Makenzie Roberts
// Last Edited:		December 19, 2022

const loader = document.querySelector("#loader");
const chart = document.querySelector("#bubble-chart");
const form = document.querySelector("#subreddit-input-form");
const errorMsg = document.querySelector("#error-msg");
const chartContainer = document.querySelector("#chart-container");
const formButton = document.querySelector("#form-button");

addEventListener("DOMContentLoaded", async (event) => {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		// Disabling the form button to prevent multiple submissions during loading.
		formButton.disabled = true;

		// Hiding the loading icon, error message and chart if they are already displayed.
		loader.style.display = "none";
		chart.style.display = "none";
		errorMsg.style.display = "none";

		// Getting the user input from the form.
		const userInput = event.target[0].value;

		// Checking if the subreddit is available to fetch data from. If it is, the function returns the data, if not, it returns false.
		const fetchedSubredditData = await handleSubredditFetch(userInput);

		// Checking if the subreddit data is available or returned false due to invalid subreddit/error.
		if (!fetchedSubredditData) {
			// Displaying the error message if the subreddit doesn't exist.

			errorMsg.style.display = "block";
			// Re-enabling the form button so the user can enter another subreddit.
			formButton.disabled = false;
		} else {
			// Toggling the loading icon display, hiding it when the data is loaded.
			loader.style.display = "block";

			// Awaiting promise from the function that calls the main logic function and sends the data to the chart.
			const isLoaded = await loadChart(fetchedSubredditData);

			// Hiding the loading icon and showing the chart, re-enabling the form button.
			loader.style.display = "none";
			chart.style.display = "block";
			formButton.disabled = false;
		}
	});
});

async function handleSubredditFetch(userInput) {
	//      Description:   	Fetches the subreddit data based on the user input, catches errors and returns false if the subreddit is unavailable.
	//      Parameter:     	userInput - The subreddit name entered by the user.
	//      Returns:        Returns the subreddit data if the subreddit is available, otherwise returns false.
	let subredditData = [];
	try {
		subredditData = await getSubredditData(userInput);
		console.log(
			"🚀 ~ file: script.js:55 ~ handleSubredditFetch ~ subredditData",
			subredditData
		);
		// If a subreddit is unavailable, the API returns an error object. If that is the case, throw an error.
		if (subredditData.hasOwnProperty("error")) throw new Error();
	} catch (error) {
		return false;
	}
	return subredditData;
}

function loadChart(fetchedSubredditData) {
	//      Description:   	Sends the data to the chart function and returns the data to the promise function.
	//      Parameter:     	fetchedSubredditData - The data returned from fetching the subreddit json.
	//      Returns:       	Resolves a promise when the chart is loaded.
	return new Promise(async (resolve) => {
		const chartData = await main(fetchedSubredditData);
		await bubbleChart(chartData);
		resolve();
	});
}

async function bubbleChart(chartData) {
	const data = chartData;
	// Here is where we call our logic functions that fetch and format the data behind the scenes.

	// Tutorial Credit: https://www.webtips.dev/how-to-make-interactive-bubble-charts-in-d3-js

	// Bubble chart config
	const width = window.innerWidth * 0.95;
	const height = window.innerHeight * 0.95;

	// Currently using the empty "category" key to set the color of all bubbles. I've set
	// this up so color-coded categories can be more easily added in the future.
	const colors = {
		"": "rgb(0, 178, 133)",
	};

	// Bubble chart generation
	const generateChart = (data) => {
		const bubble = (data) =>
			d3.pack().size([width, height]).padding(2)(
				d3.hierarchy({ children: data }).sum((d) => d.score)
			);

		const svg = d3
			.select("#bubble-chart")
			.attr("width", width) // Changed from .style to .attr for firefox compatibility
			.attr("height", height); // Changed from .style to .attr for firefox compatibility

		svg.selectAll("*").remove();
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
				// Tooltip code
				tooltip.select("img").attr("src", d.data.img);
				tooltip
					.select("a")
					.attr("href", "https://www.reddit.com/r/" + d.data.name)
					.text(d.data.name);
				tooltip
					.select("span")
					.attr("class", "score")
					.text("Users: " + d.data.score);
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

async function main(fetchedSubredditData) {
	/*
	    Description:   	Main logic function that calls all other functions and returns the data to be used in the chart function.
	    Parameter:     	fetchedSubredditData - The data returned from the main logic function.
	    Returns:        The array of objects with no duplicates
	*/

	// Get unique authors from subreddit posts
	const uniqueAuthors = getSubredditAuthors(fetchedSubredditData);

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
	
	In the future (past the scope of the sprint) I intend separate the data into two
	separate arrays, one for comments and one for posts, and then display them on separate
	graphs or show the individual post/comment count on hover.
	*/
	const dupesRemoved = removeDuplicates(formattedActivity);

	/*
	Count and format data into an array of objects that can be used to create the bubble
	chart.' Category is left empty at this time, but one day (past the scope of this
	sprint) I intend to add a feature that will utilize it. In d3, category is used to
	color the bubbles, so I'm hoping in the future I can find a way to color them based on
	the type of subreddit they are (tech, gaming, memes, etc.)

		Format: {name: subreddit, category: "", score: count}
	*/
	const dataPoints = formatDataPoint(dupesRemoved);

	/*
	We return the dataPoints array so that we can use it in the bubble chart function.
	This function is called inside the bubble chart generation function.
	*/

	// Log table of data points to console
	console.table(dataPoints);

	return dataPoints;
}

async function getSubredditData(userInput) {
	/*
	    Description:   Fetch subreddit data from reddit.com/r/<userInput>.json
	    Parameter:     The subreddit to fetch data from (user input)
	    Returns:       Raw json data from the subreddit, or false if there is an error
	*/

	let data = [];
	data = await fetch(`https://www.reddit.com/r/${userInput}.json`)
		.then((response) => {
			if (
				response.hasOwnProperty("error") &&
				!response.data.children.length > 0
			) {
				throw new Error();
			}
			return response.json();
		})
		.catch((error) => {
			console.error("Error:", error);
			return false;
		});
	console.log("🚀 ~ file: script.js:214 ~ getSubredditData ~ data", data);
	return data;
}

function getSubredditAuthors(data) {
	/*
	     Description:   Gets authors from subreddit posts
	     Parameter:     Raw subreddit data from r/<subreddit>.json
	     Returns:       An array containing the unique authors from the subreddit
	*/

	const authors = data.data.children.map((post) => post.data.author);

	// Use set to only get unique authors
	const uniqueAuthors = Array.from([...new Set(authors)]);

	return uniqueAuthors;
}

async function getUserActivity(uniqueAuthors) {
	/*
		Description:    Fetch's user data and extracts the posts.
		Parameter:      Array of unique authors
		Returns:        An object containing the user and their posts, if a user's
	     				account has been deleted or suspended, it will return false 
						and is not included in the data.
	*/

	// For each post's author in the target subreddit, go to their profile and get their posts and extract the names of each subreddit they've posted in

	let allActivityResults = [];

	for (const user of uniqueAuthors) {
		let userActivityResult = [];
		userActivityResult = await fetch(`https://www.reddit.com/user/${user}.json`)
			.then((response) => {
				return response.json();
			})
			.catch((error) => {
				console.log(error);
				console.log("Error fetching user activity for user: ", user);
				return false;
			});
		/*
		If an account has been deleted or suspended, the asyncResult will contain an
		error property. We don't want to include those in our data, so we only push to
		the array if there is no error property and the data is not empty or false.
		*/
		if (
			!userActivityResult.hasOwnProperty("error") &&
			userActivityResult.data.children.length > 0 &&
			userActivityResult !== false
		) {
			allActivityResults.push({
				user: user,
				rawUserActivity: userActivityResult.data.children,
			});
		}
	}

	return allActivityResults;
}

function formatUserActivity(userActivity) {
	/*
	    Description:   	Formats user activity into an array of objects that can be
	     				easily counted, while also removing NSFW posts from the data.
	    Parameter:    	Array of objects containing user and their raw user activity
		Example:
						[ 0:
							{
								user: "_unsusceptible",
								rawUserActivity: [
									{
										kind: "t1",
										data: {
											subreddit_id: "t5_2tex6",
										},
									},

	    Returns:        An array of objects containing the subreddit, user, and type of post
	*/

	let userSubreddits = [];

	userActivity.forEach((obj) => {
		let user = obj.user;

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

	return userSubreddits;
}

function removeNSFW(obj) {
	/*
	    Description:   	Removes NSFW posts from an array of objects
	    Parameter:      An object containing the user and their raw user activity
	    Returns:        The object with NSFW posts removed
	*/

	const filteredData = obj.rawUserActivity.filter(checkNSFW);

	function checkNSFW(post) {
		return post.data.over_18 === false;
	}

	return filteredData;
}

function removeDuplicates(arr) {
	/*
	    Description:   	Removes duplicates from an array of objects
	    Parameter:     	Array of objects containing the subreddit, user, and type of post
	    Returns:        The array of objects with no duplicates
	*/

	/*
	I'm not interested in how much they've posted in each subreddit at this time, I
	just want to find out which subreddits they've posted/commented in)

	For the first stage of this project (within the scope of this sprint) I'm not going
	to focus on whether or not the activity was a post or comment, so for now, if a
	user has both posted and commented in a subreddit, whichever is less recent will be
	removed as a duplicate.

	Although I'm not using the 'type' attribute yet, I'm going to keep it in the object
	for now, so that in the future I can come back to this code and add the
	functionality to count posts and comments separately.
	*/

	// !REFERENCE: https://www.adamdehaven.com/blog/how-to-remove-duplicate-objects-from-a-javascript-array/#usage-

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
	/*
	    Description:   	Counts occurrences of each subreddit in the array of objects, then formats the data into an array of objects that can be used to create a chart
	    Parameter:     	Array of objects containing the subreddit, user, and type of post
	    Returns:        An array of objects that can be used to create the chart - containing the subreddit, category, and score
	*/

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

	return dataPoints;
}
