import { Profile } from "@/lib/types";

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import {
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export function ProfileMenu({ profiles }: { profiles: Profile[] }) {
    return (
        <div className="flex items-center justify-between">
            <DropdownMenu>

                <div className="relative">
                    <select
                        id="profile"
                        name="profileId"
                        className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 dark:border-zinc-800 dark:bg-zinc-950"
                        defaultValue=""
                        aria-describedby="profile-error"
                    >
                        <option value="" disabled>
                            Select a profile
                        </option>
                        {
                            profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name}
                                </option>
                            ))
                        }

                    </select>

                    <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    
                </div>

            </DropdownMenu>
        </div>
    )
}