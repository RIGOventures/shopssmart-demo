"use client";

import { type Session, Profile } from '@/lib/types'

import { useState } from 'react';

import { createProfile } from '@/app/actions';

import { Button } from '@/components/ui/button'
import { ProfileMenu } from './profile-menu';
import { ProfileCreateDialog } from './profile-create-dialog';

import { PlusIcon } from '@heroicons/react/24/outline';

export interface UserMenuProps {
    user: Session['user'],
    profiles: Profile[]
}

export function ProfilePanel({ user, profiles }: UserMenuProps) {

	const [profileDialogOpen, setProfileDialogOpen] = useState(false)

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