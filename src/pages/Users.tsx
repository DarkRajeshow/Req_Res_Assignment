import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil, Trash2, Search, LogOut, Filter, SortAsc, SortDesc, RefreshCcw } from 'lucide-react'
import { getUsers, deleteUser } from '@/lib/api'
import { logout } from '@/lib/auth'
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
        } catch (error) {
            toast.error('Failed to delete user')
        }
    }

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selectedUsers.map(id => deleteUser(id)))
            setDeletedUsers(prev => [...prev, ...selectedUsers])
            setSelectedUsers([])
            toast.success('Selected users deleted successfully')
        } catch (error) {
            toast.error('Failed to delete users')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const filteredAndSortedUsers = data?.data
        .filter((user: any) => !deletedUsers.includes(user.id))
        .filter((user: any) =>
            `${user.first_name} ${user.last_name} ${user.email}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        )
        .sort((a: any, b: any) => {
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
        <div className="container mx-auto py-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-2xl font-bold">Users Management</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage and organize your users efficiently
                        </p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
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
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                            {selectedUsers.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Selected ({selectedUsers.length})
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

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='flex items-center justify-center'>
                                            <Checkbox
                                                // type="checkbox"
                                                checked={selectedUsers.length === filteredAndSortedUsers?.length}
                                                onClick={() => {
                                                    if (selectedUsers.length !== filteredAndSortedUsers?.length) {
                                                        setSelectedUsers(filteredAndSortedUsers?.map((u: any) => u.id) || [])
                                                    } else {
                                                        setSelectedUsers([])
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead>Avatar</TableHead>
                                        <TableHead>First Name</TableHead>
                                        <TableHead>Last Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : (
                                        filteredAndSortedUsers?.map((user: any) => (
                                            <TableRow key={user.id} className="group hover:bg-muted/50">
                                                <TableCell className='flex items-center justify-center pt-5'>
                                                    <Checkbox
                                                        // type="checkbox"
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
                                                        className="w-10 h-10 rounded-full ring-2 ring-primary/10"
                                                    />
                                                </TableCell>
                                                <TableCell>{user.first_name}</TableCell>
                                                <TableCell>{user.last_name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Active
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => navigate(`/users/${user.id}/edit`)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
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

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {filteredAndSortedUsers?.length || 0} of {data?.total || 0} users
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!data?.total_pages || page === data.total_pages}
                                    onClick={() => setPage(p => p + 1)}
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