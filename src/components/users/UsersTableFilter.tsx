import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SORT_OPTIONS, PAGE_SIZE_OPTIONS } from '@/types/api'
import { useUsersContext } from '@/contexts/UsersContext'
import { useUsersHandlers } from '@/hooks/useUsersHandlers'

export function UsersTableFilter() {
    const { filters } = useUsersContext()
    const handlers = useUsersHandlers()

    return (
        <div className="mb-4 flex items-center gap-2">
            <Input
                placeholder="Поиск по email"
                value={filters.search}
                onChange={handlers.search}
                className="w-64"
            />
            <Select
                value={filters.sortBy}
                onChange={handlers.sortBy}
                options={SORT_OPTIONS}
            />
            <Button onClick={handlers.sortToggle}>
                {filters.desc ? '↓ По убыванию' : '↑ По возрастанию'}
            </Button>
            <Select
                value={filters.pageSize.toString()}
                onChange={handlers.pageSize}
                options={PAGE_SIZE_OPTIONS.map(size => ({
                    value: size.toString(),
                    label: `${size}/страница`
                }))}
            />
        </div>
    )
}
