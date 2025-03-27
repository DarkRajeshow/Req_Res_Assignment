import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { login } from '../lib/auth'

export default function Login() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            await login({
                email: formData.get('email') as string,
                password: formData.get('password') as string,
            })
            toast.success('Welcome back! Login successful', {
                icon: '👋',
            })
            navigate('/users')
        } catch {
            toast.error('Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-[400px] mx-auto">
                <CardHeader className='mb-4'>
                    <CardTitle className='text-xl sm:text-2xl text-center font-bold'>Login</CardTitle>
                    <CardDescription className='text-center text-sm'>
                        Welcome back! Please login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                            <div className="relative">
                                <Mail className="absolute size-4 sm:size-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    defaultValue="eve.holt@reqres.in"
                                    required
                                    className="pl-10 h-9 sm:h-10 text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                            <div className="relative">
                                <Lock className="absolute size-4 sm:size-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    defaultValue="cityslicka"
                                    required
                                    className="pl-10 h-9 sm:h-10 text-sm sm:text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ?
                                        <EyeOff className='size-4 sm:size-5' /> :
                                        <Eye className='size-4 sm:size-5' />
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                onClick={() => setRememberMe((prev) => !prev)}
                                id="rememberMe"
                                checked={rememberMe}
                                className="size-4 sm:size-5"
                            />
                            <Label htmlFor="rememberMe" className="text-sm sm:text-base">Remember me</Label>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-9 sm:h-10 text-sm sm:text-base"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className='flex items-center justify-center gap-2 sm:gap-3'>
                                    working on...
                                    <Loader2 className="animate-spin size-4 sm:size-5" />
                                </span>
                            ) : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}