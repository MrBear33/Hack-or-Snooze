'use strict'

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com'

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
	/** Make instance of Story from data object about story:
	 *   - {title, author, url, username, storyId, createdAt}
	 */

	constructor({ storyId, title, author, url, username, createdAt }) {
		this.storyId = storyId
		this.title = title
		this.author = author
		this.url = url
		this.username = username
		this.createdAt = createdAt
	}

	/** Parses hostname out of URL and returns it. */

	getHostName() {
		try {
			const url = new URL(this.url)
			return url.hostname
		} catch (error) {
			console.error('Error parsing URL', error)
			return 'unknown'
		}
	}
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
	constructor(stories) {
		this.stories = stories
	}

	/** Generate a new StoryList. It:
	 *
	 *  - calls the API
	 *  - builds an array of Story instances
	 *  - makes a single StoryList instance out of that
	 *  - returns the StoryList instance.
	 */

	static async getStories() {
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: 'GET',
		})

		const stories = response.data.stories.map((story) => new Story(story))
		return new StoryList(stories)
	}

	/** Adds story data to API, makes a Story instance, adds it to story list.
	 * - user - the current instance of User who will post the story
	 * - obj of {title, author, url}
	 *
	 * Returns the new Story instance
	 */
	async addStory(user, { title, author, url }) {
		const token = user.loginToken
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: 'POST',
			data: {
				token,
				story: { title, author, url },
			},
		})

		const newStory = new Story(response.data.story)
		this.stories.unshift(newStory)
		user.ownStories.unshift(newStory)

		return newStory
	}

	/** Deletes a story from the API and removes it from the story list */
	async removeStory(user, storyId) {
		const token = user.loginToken
		await axios({
			url: `${BASE_URL}/stories/${storyId}`,
			method: 'DELETE',
			data: { token },
		})

		// Remove story from the list of stories
		this.stories = this.stories.filter((story) => story.storyId !== storyId)

		// Remove story from user's own stories
		user.ownStories = user.ownStories.filter((s) => s.storyId !== storyId)
	}
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
	/** Make user instance from obj of user data and a token:
	 *   - {username, name, createdAt, favorites[], ownStories[]}
	 *   - token
	 */

	constructor(
		{ username, name, createdAt, favorites = [], ownStories = [] },
		token
	) {
		this.username = username
		this.name = name
		this.createdAt = createdAt

		this.favorites = favorites.map((s) => new Story(s))
		this.ownStories = ownStories.map((s) => new Story(s))

		this.loginToken = token
	}

	/** Register new user in API, make User instance & return it.
	 *
	 * - username: a new username
	 * - password: a new password
	 * - name: the user's full name
	 */

	static async signup(username, password, name) {
		const response = await axios({
			url: `${BASE_URL}/signup`,
			method: 'POST',
			data: { user: { username, password, name } },
		})

		let { user } = response.data

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		)
	}

	/** Login in user with API, make User instance & return it.
	 * - username: an existing user's username
	 * - password: an existing user's password
	 */

	static async login(username, password) {
		const response = await axios({
			url: `${BASE_URL}/login`,
			method: 'POST',
			data: { user: { username, password } },
		})

		let { user } = response.data

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		)
	}

	/** When we already have credentials (token & username) for a user,
	 *   we can log them in automatically. This function does that.
	 */

	static async loginViaStoredCredentials(token, username) {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${username}`,
				method: 'GET',
				params: { token },
			})

			let { user } = response.data

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				token
			)
		} catch (err) {
			console.error('loginViaStoredCredentials failed', err)
			return null
		}
	}

	/**
	 * Add a story to the list of user's favorites and update the API
	 * - storyId: ID of the story to be favorited
	 */
	async addFavorite(storyId) {
		this.favorites.push(storyId)
		await this.updateFavorite(storyId, 'add')
	}

	/**
	 * Remove a story from the list of user's favorites and update the API
	 * - storyId: ID of the story to be unfavorited
	 */
	async removeFavorite(storyId) {
		this.favorites = this.favorites.filter((fav) => fav.storyId !== storyId)
		await this.updateFavorite(storyId, 'remove')
	}

	/**
	 * Helper method to update the favorite stories in the API
	 * - storyId: ID of the story
	 * - action: "add" or "remove"
	 */
	async updateFavorite(storyId, action) {
		const method = action === 'add' ? 'POST' : 'DELETE'
		const token = this.loginToken
		await axios({
			url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
			method,
			data: { token },
		})
	}
}
