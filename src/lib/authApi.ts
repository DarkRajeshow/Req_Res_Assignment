import axios from 'axios'

const API_URL = 'https://reqres.in/api'

export interface LoginCredentials {
    email: string
    password: string
}

export const login = async (credentials: LoginCredentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials)
    const token = response.data.token
    localStorage.setItem('token', token)
    return token
}

export const logout = () => {
    localStorage.removeItem('token')
}

export const getToken = () => {
    return localStorage.getItem('token')
}

export const isAuthenticated = () => {
    return !!getToken()
}