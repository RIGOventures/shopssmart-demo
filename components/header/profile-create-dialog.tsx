'use client'

import { Result, ServerActionResult, Session } from '@/lib/types'
import { type DialogProps } from '@radix-ui/react-dialog'

import { useEffect, useTransition, useCallback } from 'react';
import { useFormState } from 'react-dom'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { getMessageFromCode } from '@/lib/utils/result';

interface ProfileCreateDialogProps extends DialogProps {
    user: Session['user'],
    createProfile: (userId: string, prevState: Result | undefined, formData: FormData) => Promise<Result>
    onCreate: () => void
}

export function ProfileCreateDialog({
    user,
    createProfile,
    onCreate,
    ...props
}: ProfileCreateDialogProps) {
 
    const [isCreatePending, startCreateTransition] = useTransition()

    // Augment submit aciton
	const createProfileWithId = createProfile.bind(null, user.id);
	const [result, formAction] = useFormState(createProfileWithId, undefined);

    // Add toast to update state change
    useEffect(() => {
        if (result) {
            if (result.type === 'error') {
                toast.error(getMessageFromCode(result.resultCode))
            } else {
                toast.success(getMessageFromCode(result.resultCode))
                onCreate()
            }
        }
    }, [result])
    
    return (
        <Dialog {...props}>
            <DialogContent>

                <DialogHeader>
                    <DialogTitle>
                        Create a new profile
                    </DialogTitle>
                    <DialogDescription>
                        Add a new profile with separate preferences.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="items-center">

                    <form 
                        action={formAction} 
                        className="w-full flex justify-between"
                        onSubmit={() => {
                            startCreateTransition(async () => {
                                // Purely aesthetic
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            })
                        }}
                    >

                        <input
                            name="profileName"
                            id="profileName"
                            type="text"
                            placeholder="Enter profile name"
                            className="peer block w-full rounded-md border mr-2 border-gray-200 text-sm outline-2 placeholder:text-gray-500 dark:border-zinc-800 dark:bg-zinc-950"
                        />

                        <Button
                            disabled={isCreatePending}
                        >
                            {isCreatePending ? (
                                <>
                                    <IconSpinner className="mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>Create</>
                            )}
                        </Button>

                    </form>

                </DialogFooter>
               
            </DialogContent>
        </Dialog>
    )
}