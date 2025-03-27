import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Trash2, Search, LogOut, Filter, SortAsc, SortDesc, RefreshCcw } from 'lucide-react'
import { getUsers, deleteUser, User } from '@/lib/usersApi'
import { logout } from '@/lib/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export default function Users() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<'first_name' | 'last_name' | 'email'>('first_name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [deletedUsers, setDeletedUsers] = useState<number[]>([])
    const [selectedUsers, setSelectedUsers] = useState<number[]>([])

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['users', page],
        queryFn: () => getUsers(page),
    })

    const handleSort = useCallback((field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }, [sortField])

    const handleDelete = async (id: number) => {
        try {
            await deleteUser(id)
            setDeletedUsers(prev => [...prev, id])
            setSelectedUsers(prev => prev.filter(uid => uid !== id))
            toast.success('User deleted successfully')
        } catch {
            toast.error('Failed to delete user')
        }
    }

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedUsers.map(id => deleteUser(id)))
            setDeletedUsers(prev => [...prev, ...selectedUsers])
            setSelectedUsers([])
            toast.success('Selected users deleted successfully')
        } catch {
            toast.error('Failed to delete users')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const filteredAndSortedUsers = data?.data
        .filter((user: User) => !deletedUsers.includes(user.id))
        .filter((user: User) =>
            `${user.first_name} ${user.last_name} ${user.email}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        )
        .sort((a: User, b: User) => {
            const compareValue = sortDirection === 'asc' ? 1 : -1
            return a[sortField] > b[sortField] ? compareValue : -compareValue
        })

    const LoadingSkeleton = () => (
        Array(6).fill(0).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
            </TableRow>
        ))
    )

    return (
        <div className="container mx-auto p-4 sm:py-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold">Users Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage and organize your users efficiently
                        </p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10 h-9 sm:h-10 text-sm sm:text-base"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-9 sm:h-10 text-sm sm:text-base">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Filter & Sort
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleSort('first_name')}>
                                            Sort by First Name {sortField === 'first_name' && (
                                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSort('last_name')}>
                                            Sort by Last Name {sortField === 'last_name' && (
                                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSort('email')}>
                                            Sort by Email {sortField === 'email' && (
                                                sortDirection === 'asc' ? <SortAsc className="ml-2 h-4 w-4" /> : <SortDesc className="ml-2 h-4 w-4" />
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button 
                                    variant="outline" 
                                    onClick={() => refetch()} 
                                    className="h-9 sm:h-10 text-sm sm:text-base"
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                                {selectedUsers.length > 0 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="destructive"
                                                className="h-9 sm:h-10 text-sm sm:text-base"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete ({selectedUsers.length})
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the
                                                    selected users and remove their data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleBulkDelete}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[40px] sm:w-[50px]'>
                                            <Checkbox
                                                className="size-4 sm:size-5"
                                                checked={selectedUsers.length === filteredAndSortedUsers?.length}
                                                onClick={() => {
                                                    if (selectedUsers.length !== filteredAndSortedUsers?.length) {
                                                        setSelectedUsers(filteredAndSortedUsers?.map((u: User) => u.id) || [])
                                                    } else {
                                                        setSelectedUsers([])
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead className='w-[60px] sm:w-[80px]'>Avatar</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className='w-[100px] sm:w-[120px]'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : (
                                        filteredAndSortedUsers?.map((user: User) => (
                                            <TableRow key={user.id} className="group hover:bg-muted/50">
                                                <TableCell>
                                                    <Checkbox
                                                        className="size-4 sm:size-5"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onClick={() => {
                                                            if (selectedUsers.indexOf(user.id) === -1) {
                                                                setSelectedUsers(prev => [...prev, user.id])
                                                            } else {
                                                                setSelectedUsers(prev => prev.filter(id => id !== user.id))
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.first_name}
                                                        className="size-8 sm:size-10 rounded-full ring-2 ring-primary/10"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-sm sm:text-base">{user.first_name}</TableCell>
                                                <TableCell className="text-sm sm:text-base">{user.last_name}</TableCell>
                                                <TableCell className="hidden sm:table-cell text-sm sm:text-base">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs sm:text-sm bg-green-50 text-green-700">
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 sm:h-9 sm:w-9"
                                                            onClick={() => navigate(`/users/${user.id}/edit`)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the
                                                                        user and remove their data from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                                Showing {filteredAndSortedUsers?.length || 0} of {data?.total || 0} users
                            </p>
                            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="flex-1 sm:flex-none h-9 sm:h-10 text-sm sm:text-base"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!data?.total_pages || page === data.total_pages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="flex-1 sm:flex-none h-9 sm:h-10 text-sm sm:text-base"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}