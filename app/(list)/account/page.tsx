export default function Page() {
    return (
        <div
                className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
            >
            <div className="fixed inset-x-0 w-full from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
                <p className="space-y-4 border-t bg-background px-4 py-2 sm:rounded-t-xl sm:border md:py-4">
                    Account Page
                </p>
            </div>
        </div>
    )
}