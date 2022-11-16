const feedDisplay = document.querySelector("#feed");

// fetch("http://localhost:8000/results")
// 	.then((response) => {
// 		return response.json();
// 	})
// 	.then((data) => {
// 		data.forEach((post) => {
// 			const postItem =
// 				`<div><h3>` + post.title + `</h3><p>` + post.url + `</p></div>`;
// 			feedDisplay.insertAdjacentHTML("beforeend", postItem);
// 		});
// 	})
// 	.catch((err) => console.log(err));

// fetch("https://www.reddit.com/r/ProgrammerHumor.json")
// 	.then((response) => response.json())
// 	.then((data) => {
// 		console.log(data.data.children);
// 		data.data.children.forEach((post) => {
// 			const upvotes = post.data.ups;
// 			const width = upvotes / 1000;
// 			console.log(post.data.ups);
// 			const postItem = `<div>
//                                     <h3>${post.data.title}</h3>
//                                     <img src="${post.data.url}" width="auto" height="auto">
//                                     <br>
//                                     <p>Upvotes: ${post.data.ups}</p>
//                                 </div>`;
// 			feedDisplay.insertAdjacentHTML("beforeend", postItem);
// 		});
// 	});

getData();

async function getData() {
	const data = await fetch("https://www.reddit.com/r/ProgrammerHumor.json")
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
	console.log(data);
	// const test = data.data.children.forEach((post) => {
	// 	console.log("post", post);
	// 	const author = post.data.author;
	// 	authors.push(author);
	// 	console.log("author array: " + authors);
	// 	const title = post.data.title;
	// 	const url = post.data.url;
	// 	console.log(post.data.author);
	// 	const postItem = `<div>
	//                                         <p>Author: ${author}</p>
	//                                     </div>`;
	// 	feedDisplay.insertAdjacentHTML("beforeend", postItem);
	// });

	const authors = data.data.children.map((post) => post.data.author);
	// Only get unique authors
	const uniqueAuthors = Array.from([...new Set(authors)]);
	console.log("authors", authors);
	console.log("unique authors", uniqueAuthors);
	getUserPosts(uniqueAuthors);
}
// async function myFunction(item) {
// 	const userPosts = await fetch(

// 		`https://www.reddit.com/user/${item}.json`
// 	).then((response) => response.json());
// 	console.log("user posts", userPosts);
// 	return userPosts;
// }

// (?) Does this function need to be async? does the foreach need to be async?
async function getUserPosts(uniqueAuthors) {
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

	// For each post's author in the target subreddit, go to their profile and get the names of each subreddit they've posted in

	uniqueAuthors.forEach(async function (user) {
		const userPostsData = await fetch(
			`https://www.reddit.com/user/${user}.json`
		).then((response) => response.json());

		console.log(user);
		// Console log just the posts
		console.log(userPostsData.data.children);
		const userPosts = userPostsData.data.children;
		// This foreach function will loop through each post of a user and get the subreddit name for each post
		const subreddits = userPostsData.data.children.map(
			(post) => post.data.subreddit
		);

		// Use set to elimate duplicates, then convert back to an array
		const uniqueSubreddits = Array.from([...new Set(subreddits)]);
		console.log(`user: ${user}, subreddits: ${uniqueSubreddits}`);
		const userSubredditsObj = {
			user: user,
			postSubreddits: uniqueSubreddits,
		};
		console.log(userSubredditsObj);
		// userPosts.forEach((post) => {
		// 	console.log(post.data.subreddit);
		//     const subreddit = post.data.subreddit;
		// 	const uniqueAuthors = Array.from([...new Set(authors)]);
		// });
	});

	// for(var i=0; i<years.length; i++) {
	//     df.appendChild(createYearOption(years[i]));
	//   }
	// const userPostsData = await fetch(
	// 	"https://www.reddit.com/user/FEMsleep.json"
	// ).then((response) => response.json());

	// const userPosts = userPostsData.data.children.map((post) => post.data.author);
	// const userPosts = userPostsData.data.children.map(
	// 	(post) => post.data.subreddit
	// );

	// const userPostsData = uniqueAuthors.forEach((author) => {
	// 	fetch(`https://www.reddit.com/user/${author}.json`).then((response) =>
	//     response.json()
	// );

	// const userSubreddits = await fetch(
	// 	"https://www.reddit.com/user/username/submitted.json"
	// ).then((response) => response.json());
	console.log("user posts", subreddits);
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
