'use client';

import { Profile } from "@/lib/types";

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
import { setProfile } from "@/app/actions";

export function ProfileMenu({ email, profiles }: { email: string, profiles: Profile[] }) {

    console.log(profiles)

    async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        var target = event.target
        
        var index = target.options.selectedIndex - 1
        var profile = profiles[index]
        if (profile.id == "default") return
       
        await setProfile(email, profile.id)
    }

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
                        onChange={handleChange}
                    >
                        <option value="" disabled >
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