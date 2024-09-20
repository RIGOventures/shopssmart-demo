"use client";

import { type Session, Profile } from '@/lib/types'

import { useEffect, useState } from 'react';

import { getProfiles } from '@/app/actions';
import { createProfile } from '@/app/actions';

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProfileMenu } from './profile-menu';
import { ProfileCreateDialog } from './profile-create-dialog';

import { PlusIcon } from '@heroicons/react/24/outline';

export interface UserMenuProps {
    user: Session['user']
}

export function ProfilePanel({ user }: UserMenuProps) {

    const [profiles, setProfiles] = useState([] as Profile[])
    const [profileDialogOpen, setProfileDialogOpen] = useState(false)

    // Get latest preference
	useEffect(() => {
        getProfiles(user.id).then((result) => {
			if (result) {
                if ('error' in result) {
                    toast.error(result.error)
                    return
                }

                // Update profiles
                setProfiles(result)
            }
		})
    }, [user])

	return (
		<>
			<ProfileMenu email={user.email} profiles={profiles} />
            <Button 
                variant="ghost"
                size="icon"
                onClick={() => setProfileDialogOpen(true)}
            >
                <PlusIcon className="size-6 transition-all"/>
            </Button>
            <ProfileCreateDialog
                open={profileDialogOpen}
                onOpenChange={setProfileDialogOpen}
                onCreate={() => setProfileDialogOpen(false)}
                createProfile={createProfile}
                user={user}
            />
		</>
	)
}