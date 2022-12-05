// const feedDisplay = document.querySelector("#feed");

main();
async function main() {
	const subredditData = await getSubredditData();
	const uniqueAuthors = getSubredditAuthors(subredditData);
	const userActivity = await getUserActivity(uniqueAuthors);

	// const userSubreddits = getUserSubreddits(userActivity);

	// {subreddit: "subreddit", username: "username", type: "type" }
	const formattedActivity = formatUserActivity(userActivity);
	let dupesRemoved = removeDuplicates(formattedActivity);
	console.log("calling dupesRemoved: ", dupesRemoved);
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
		/* ***************************** vvv old map vvv **************************** */
		// let dataObj = subredditData.map((post) => {
		// 	return {
		// 		subreddit: post.data.subreddit,
		// 		data: {
		// 			username: user,
		// 			type: post.kind,
		// 		},
		// 	};
		// });
		/* ***************************** ^^^ old map ^^^ **************************** */
		// Remove duplicates (I'm not interested in how much they've posted in each subreddit at this time, I just want to find out which subreddits they've posted in)
		// console.log("subredditData (After nsfw removal): ", dataObj);
		// I'm going to get rid of duplicates later... I may want to know how many times they've posted in each subreddit later. The more data
		// subreddits = Array.from([...new Set(subreddits)]);
		// let userSubredditsObj = { user: user, data: dataObj };
		// userSubreddits.push(dataObj);
	});
	console.log("user subreddits", userSubreddits);

	return userSubreddits;
}

function removeDuplicates(arr) {
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
	//-------------
	// 	const seen = new Set();
	// const arr = [
	//   { id: 1, name: "test1" },
	//   { id: 2, name: "test2" },
	//   { id: 2, name: "test3" },
	//   { id: 3, name: "test4" },
	//   { id: 4, name: "test5" },
	//   { id: 5, name: "test6" },
	//   { id: 5, name: "test7" },
	//   { id: 6, name: "test8" }
	// ];
	// const filteredArr = arr.filter(elem => {

	//   const duplicate = seen.has(elem.id);
	//   seen.add(elem.id);
	//   return !duplicate;
	// });
	// !REFERENCE: https://bobbyhadz.com/blog/javascript-remove-duplicates-from-array-of-objects#:~:text=To%20remove%20the%20duplicates%20from%20an%20array%20of%20objects%3A&text=Use%20the%20Array.,IDs%20in%20the%20new%20array.
	// const arr = [
	// 	{ id: 1, name: "Tom" },
	// 	{ id: 1, name: "Tom" },
	// 	{ id: 2, name: "Nick" },
	// 	{ id: 2, name: "Nick" },
	// ];
	//----------------
	// const uniqueIds = [];
	// const unique = arr.filter((element) => {
	// 	const isDuplicate = uniqueIds.includes({
	// 		subreddit: element.subreddit,
	// 		username: element.username,
	// 		type: element.type,
	// 	});
	// 	if (!isDuplicate) {
	// 		uniqueIds.push({
	// 			subreddit: element.subreddit,
	// 			username: element.username,
	// 			type: element.type,
	// 		});
	// 		return true;
	// 	}
	// 	return false;
	// });
	// // 👇️ [{id: 1, name: 'Tom'}, {id: 2, name: 'Nick'}]
	// console.log("unique", unique);
	return unique;
}
/* ******************************* vvv OLD vvv ****************************** */
// function getUserSubreddits(userActivity) {
// 	// This function will get subreddits that user has posted/commented in. Later I'll make the function that filters out one or the other using the t1/t3 values
// 	let userSubreddits = [];
// 	userActivity.forEach((obj) => {
// 		let user = obj.user;
// 		// let filtered = removeNSFW(obj.rawUserActivity);
// 		console.log("BEFORE NSFW REMOVAL:", obj);

// 		// filter out data from nsfw subreddits
// 		const subredditData = removeNSFW(obj);

// 		let dataObj = subredditData.map((post) => {
// 			return { subreddit: post.data.subreddit, type: post.kind };
// 		});
// 		// Remove duplicates (I'm not interested in how much they've posted in each subreddit at this time, I just want to find out which subreddits they've posted in)
// 		console.log("subredditData (After nsfw removal): ", dataObj);
// 		// I'm going to get rid of duplicates later... I may want to know how many times they've posted in each subreddit later. The more data
// 		// subreddits = Array.from([...new Set(subreddits)]);
// 		let userSubredditsObj = { user: user, data: dataObj };
// 		userSubreddits.push(userSubredditsObj);
// 	});
// 	console.log("user subreddits", userSubreddits);
// 	return userSubreddits;
// }
/* ******************************* ^^^ OLD ^^^ ****************************** */
function removeNSFW(obj) {
	let filteredData = obj.rawUserActivity.filter(checkNSFW);

	function checkNSFW(post) {
		if (post.data.over_18) console.log("NSFW POST:", post);
		return post.data.over_18 === false;
	}

	return filteredData;

	// let safeForWork = obj.rawUserActivity.map((post) => {
	// 	// This if statement will filter out posts that are NFSW
	// 	// Currently, this is only formatting the data. If a post is NSFW it will be undefined and removed below using filter(). I will make this more efficient later on, possibly using reduce()? But this works for now.
	// 	if (post.data.over_18 === false) {
	// 		return { subreddit: post.data.subreddit, type: post.kind };
	// 	} else {
	// 		console.log("NSFW POST FOUND: ", post.data.subreddit);
	// 	}
	// });
}

// function countUserSubreddits(userSubreddits) {
// 	// This function will count how many times a subreddit name occurs in the userSubreddits array
// 	let subCount = [{ name: "", number: "" }];
// 	userSubreddits.forEach((dataset) => {
// 		//iterate through each users subreddits and count how many times each subreddit occurs
// 		// Needs to be completed before I can add to the object
// 		dataset.count = subCount;
// 		dataset.count.name = dataset.subreddits;
// 	});
// 	return userSubreddits;
// }

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

async function getPostSubreddits(userActivity) {
	// Description:    Extracts the subreddit name from each post and returns an array of unique subreddits

	// Parameter:      userActivity - object containing the user and their posts

	// Returns:        Array(?) of unique subreddits
	console.log("FUNCTION WORKY", userActivity);

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

// .then((data) => {
//     console.log(data.data.children);
//     data.data.children.forEach((post) => {
//         const author = post.data.author;
//         authors.push(author);
//         console.log("author array: " + authors);
//         const title = post.data.title;
//         const url = post.data.url;
//         console.log(post.data.author);
//         const postItem = `<div>
//                                     <p>Author: ${author}</p>
//                                 </div>`;
//         feedDisplay.insertAdjacentHTML("beforeend", postItem);
//     });
// });

// fetch("https://www.reddit.com/r/ProgrammerHumor.json")
// 	.then((response) => response.json())
// 	.then((data) => {
// 		console.log(data.data.children);
// 		data.data.children.forEach((post) => {
// 			const author = post.data.author;
// 			const title = post.data.title;
// 			const url = post.data.url;
// 			console.log(post.data.author);
// 			const postItem = `<div>
//                                     <p>Upvotes: ${author}</p>
//                                 </div>`;
// 			feedDisplay.insertAdjacentHTML("beforeend", postItem);
// 		});
// 	});

// https://www.reddit.com/user/lurker4memes.json

// // We have to get chips after we get fish...
// async getFishAndChips() {
//     const fish = await fetch(this.fishApiUrl).then(response => response.json());
//     this.fish = fish;

//     const fishIds = fish.map(fish => fish.id),
//       chipReqOpts = { method: 'POST', body: JSON.stringify({ fishIds }) };

//     const chips = await fetch(this.chipsApiUrl, chipReqOpts).then(response => response.json());
//     this.chips = chips;
// }
