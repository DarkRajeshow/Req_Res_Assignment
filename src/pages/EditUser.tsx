import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUserById, updateUser, User } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function EditUser() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const { data: userData, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await getUserById(Number(id))
            return response.data
        },
    })

    const mutation = useMutation({
        mutationFn: (formData: FormData) => {
            const data: Partial<User> = {
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                email: formData.get('email') as string,
                avatar: formData.get('profile_picture') as string,
            }
            return updateUser(Number(id), data)
        },
        onSuccess: () => {
            toast.success('User updated successfully')
            navigate('/users')
        },
        onError: () => {
            toast.error('Failed to update user')
        },
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        mutation.mutate(formData)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:py-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                            <Skeleton className="h-5 sm:h-6 w-1/3" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                            <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                                <Skeleton className="h-4 sm:h-5 w-1/2" />
                                <Skeleton className="h-8 sm:h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <Skeleton className="h-4 sm:h-5 w-1/4" />
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>
                        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                            <Skeleton className="h-4 sm:h-5 w-1/4" />
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>
                        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                            <Skeleton className="h-4 sm:h-5 w-1/4" />
                            <Skeleton className="h-8 sm:h-10 w-full" />
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-6">
                            <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
                            <Skeleton className="h-8 sm:h-10 w-28 sm:w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 sm:py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/users')}
                            className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <CardTitle className="text-lg sm:text-xl">Edit User</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                                <AvatarImage src={previewImage || userData.avatar || ''} alt="Profile Picture" />
                                <AvatarFallback>{userData.first_name?.[0]}{userData.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className='gap-1.5 flex flex-col w-full'>
                                <Label htmlFor="profile_picture" className="text-sm sm:text-base">Profile Picture</Label>
                                <Input
                                    id="profile_picture"
                                    name="profile_picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="h-8 sm:h-10 text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="first_name" className="text-sm sm:text-base">First Name</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                placeholder="First Name"
                                defaultValue={userData.first_name}
                                required
                                className="h-8 sm:h-10 text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="last_name" className="text-sm sm:text-base">Last Name</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                placeholder="Last Name"
                                defaultValue={userData.last_name}
                                required
                                className="h-8 sm:h-10 text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                defaultValue={userData.email}
                                required
                                className="h-8 sm:h-10 text-sm sm:text-base"
                            />
                        </div>
                        <div className="flex gap-2 sm:gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/users')}
                                className="h-8 sm:h-10 text-sm sm:text-base"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="h-8 sm:h-10 text-sm sm:text-base"
                            >
                                {mutation.isPending ? (
                                    <span className='flex items-center justify-center gap-2 sm:gap-3'>
                                        Saving...
                                        <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                                    </span>
                                ) : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}