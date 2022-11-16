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
	getUserSubreddits(uniqueAuthors);
}
// async function myFunction(item) {
// 	const userPosts = await fetch(
    
// 		`https://www.reddit.com/user/${item}.json`
// 	).then((response) => response.json());
// 	console.log("user posts", userPosts);
// 	return userPosts;
// }

async function getUserSubreddits(uniqueAuthors) {
	// loop through uniqueauthors (foeach)
	// on each iteration, fetch the user's subreddits
	// store the subreddits in an array/object
	// const userPostsData = uniqueAuthors.forEach(myFunction);
	// const subreddits = uniqueAuthors.map((author) => {
	// 	fetch(`https://www.reddit.com/user/${author}.json`)
	// 		.then((response) => response.json())
	// 		.then(console.log(author));
	// });

	for (let i = 0; i < uniqueAuthors.length; i++) {
		const userPostsData = await fetch(
			`https://www.reddit.com/user/${uniqueAuthors[i]}.json`
		).then((response) => response.json());
		console.log(userPostsData);
	}

    {
        "user": "purple",
        "subreddits": [],
    }

    uniqueAuthors.forEach(function(i) {
        df.appendChild(createYearOption(i));
    });

    for(var i=0; i<years.length; i++) {
        df.appendChild(createYearOption(years[i]));
      }
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
