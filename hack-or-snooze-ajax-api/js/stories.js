'use strict'

// This is the global list of the stories, an instance of StoryList
let storyList

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
	try {
		storyList = await StoryList.getStories()
		$storiesLoadingMsg.remove()
		putStoriesOnPage()
	} catch (error) {
		console.error('Error getting stories on start:', error)
		showError('Error getting stories. Please try again.')
	}
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
	const hostName = story.getHostName()
	const isFavorite = currentUser.favorites.some(
		(fav) => fav.storyId === story.storyId
	)
	const starType = isFavorite ? 'fas' : 'far' // solid star for favorite, empty star for non-favorite
	const showDeleteBtn = currentUser.ownStories.some(
		(s) => s.storyId === story.storyId
	)

	return $(`
    <li id="${story.storyId}">
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>
      ${showDeleteBtn ? '<button class="delete-story-btn">Delete</button>' : ''}
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `)
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
	console.debug('putStoriesOnPage')
	$allStoriesList.empty()

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story)
		$allStoriesList.append($story)
	}

	$allStoriesList.show()
}

/** Show favorite stories */
function putFavoritesListOnPage() {
	console.debug('putFavoritesListOnPage')
	$favoritesList.empty()

	for (let story of currentUser.favorites) {
		const $story = generateStoryMarkup(story)
		$favoritesList.append($story)
	}

	$favoritesList.show()
}

/** Handle submission of new story form */
async function submitNewStory(evt) {
	console.debug('submitNewStory', evt)
	evt.preventDefault()
	hideError()

	if (!currentUser) {
		console.error('User not logged in')
		showError('You must be logged in to submit a story.')
		return
	}

	const title = $('#story-title').val()
	const author = $('#story-author').val()
	const url = $('#story-url').val()

	try {
		const newStory = await storyList.addStory(currentUser, {
			title,
			author,
			url,
		})

		if (newStory) {
			const $story = generateStoryMarkup(newStory)
			$allStoriesList.prepend($story)
			$newStoryForm.slideUp('slow')
			$newStoryForm.trigger('reset')
		} else {
			throw new Error('Failed to add story')
		}
	} catch (error) {
		console.error('Error adding story:', error)
		showError('Failed to add story. Please try again.')
	}
}

$newStoryForm.on('submit', submitNewStory)

/** Handle clicking on the star to favorite/unfavorite a story */
async function toggleStoryFavorite(evt) {
	console.debug('toggleStoryFavorite')
	hideError()

	const $tgt = $(evt.target)
	const $closestLi = $tgt.closest('li')
	const storyId = $closestLi.attr('id')
	const story = storyList.stories.find((s) => s.storyId === storyId)

	try {
		if ($tgt.hasClass('fas')) {
			await currentUser.removeFavorite(storyId)
			$tgt.closest('i').toggleClass('fas far')
		} else {
			await currentUser.addFavorite(storyId)
			$tgt.closest('i').toggleClass('fas far')
		}
	} catch (error) {
		console.error('Error toggling favorite:', error)
		showError('Failed to update favorite. Please try again.')
	}
}

$body.on('click', '.star', toggleStoryFavorite)

/** Handle clicking the delete button on a story */
async function deleteStory(evt) {
	console.debug('deleteStory', evt)
	hideError()

	const $closestLi = $(evt.target).closest('li')
	const storyId = $closestLi.attr('id')

	try {
		await storyList.removeStory(currentUser, storyId)
		$closestLi.remove()
	} catch (error) {
		console.error('Error deleting story:', error)
		showError('Failed to delete story. Please try again.')
	}
}

$body.on('click', '.delete-story-btn', deleteStory)
