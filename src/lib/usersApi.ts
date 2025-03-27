import axios from 'axios'
import { getToken } from './authApi'

const API_URL = 'https://reqres.in/api'

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    avatar: string
}

export const getUsers = async (page: number = 1) => {
    const response = await api.get(`/users?page=${page}`)
    return response.data
}

export const getUserById = async (id: number = 1) => {
    const response = await api.get(`/users/${id}`)
    return response.data
}

export const updateUser = async (id: number, data: Partial<User>) => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
}

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`)
}

export default api