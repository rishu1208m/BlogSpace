import api from './axios'

export const getPosts = (params) =>
    api.get('/posts', { params })

export const getPost = (slug) =>
    api.get(`/posts/${slug}`)

export const createPost = (data) =>
    api.post('/posts', data)

export const updatePost = (slug, data) =>
    api.put(`/posts/${slug}`, data)

export const deletePost = (slug) =>
    api.delete(`/posts/${slug}`)

export const toggleLike = (slug) =>
    api.post(`/posts/${slug}/like`)

export const toggleBookmark = (slug) =>
    api.post(`/posts/${slug}/bookmark`)

export const getComments = (postId) =>
    api.get(`/comments/post/${postId}`)

export const createComment = (postId, content) =>
    api.post(`/comments/post/${postId}`, { content })

export const deleteComment = (id) =>
    api.delete(`/comments/${id}`)

export const getUserProfile = (id) =>
    api.get(`/users/${id}`)

export const getBookmarks = () =>
    api.get('/posts', { params: { bookmarked: true } })