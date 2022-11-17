const feedDisplay = document.querySelector("#feed");

main();
async function main() {
	const subredditData = await getSubredditData();
	const uniqueAuthors = getSubredditAuthors(subredditData);
	const userPosts = await getUserPosts(uniqueAuthors);
	const userSubreddits = await getPostSubreddits(userPosts); // i dont think i need await here
	console.log("user posts", userSubreddits);
}

function getPostSubreddits(userPosts) {
	// Description:    Extracts the subreddit name from each post and returns an array of unique subreddits

	// Parameter:      userPosts - object containing the user and their posts

	// Returns:        Array(?) of unique subreddits
	console.log("FUNCTION WORKY", userPosts.userPosts);
	const subreddits = userPosts.userPosts.map((post) => post.posts);
	console.log(subreddits);
	// This foreach function will loop through each post of a user and get the subreddit name for each post
	// ! Not working with the new object i made. hm. its working in foreach.js but with the object i created in foreach.js it doesnt work. maybe just use a regular old array of objects instead, with no name for the object
	userPosts.userPosts.forEach(function (user) {
		console.log(user.posts);
		const subreddits = userPosts.userPosts.map((post) => post.data.subreddit);
		console.log("SUBREDDITS", subreddits);
		//---
		// Use set to elimate duplicates, then convert back to an array
		// const uniqueSubreddits = Array.from([...new Set(subreddits)]);
		// console.log(`user: ${user}, subreddits: ${uniqueSubreddits}`);
		// const userSubredditsObj = {
		// 	user: user,
		// 	postSubreddits: uniqueSubreddits,
		// };
		//----
		// console.log(userSubredditsObj);
		// userPosts.forEach((post) => {
		// 	console.log(post.data.subreddit);
		//     const subreddit = post.data.subreddit;
		// 	const uniqueAuthors = Array.from([...new Set(authors)]);
		// });
	});
}

function getSubredditAuthors(data) {
	const authors = data.data.children.map((post) => post.data.author);
	// Only get unique authors
	const uniqueAuthors = Array.from([...new Set(authors)]);
	console.log("unique authors", uniqueAuthors);
	return uniqueAuthors;
}

async function getSubredditData() {
	const data = await fetch("https://www.reddit.com/r/ProgrammerHumor.json")
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
	console.log(data);

	return data;
}

// (?) Does this function need to be async? does the foreach need to be async?
async function getUserPosts(uniqueAuthors) {
	//      Description:    Fetch's user data and extracts the posts. Then creates a new
	//                      object containing the username and their posts, and returns it.

	//      Parameter:      uniqueAuthors - array of unique authors

	//      Returns:         Sends back an object containing the user and their posts

	// !IMPORTANT Make sure to only get subreddits where the user has posted, not comments. another function will handle comments
	// loop through uniqueauthors (foeach)
	// on each iteration, fetch the user's subreddits
	// store the subreddits in an array/object
	// const userPostsData = uniqueAuthors.forEach(myFunction);
	// const subreddits = uniqueAuthors.map((author) => {
	// 	fetch(`https://www.reddit.com/user/${author}.json`)
	// 		.then((response) => response.json())
	// 		.then(console.log(author));
	// });

	// {
	//     "user": "purple",
	//     "subreddits": [],
	// }

	// For each post's author in the target subreddit, go to their profile and get their posts and extract the names of each subreddit they've posted in
	// !IMPORTANT Make sure to only get subreddits where the user has posted, not comments. another function will handle comments
	// !IMPORTANT Remember to put .CATCH statements in each fetch request!!
	const userPosts = { userPosts: [] };
	uniqueAuthors.forEach(async function (user) {
		const userData = await fetch(
			`https://www.reddit.com/user/${user}.json`
		).then((response) => response.json());
		// Create an object with the data we want
		const userPostsObj = { user: user, posts: userData.data.children };
		userPosts.userPosts.push(userPostsObj);
	});

	return userPosts;
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
