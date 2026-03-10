'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { setActiveTenant } from '@/app/actions/tenant-actions'
import { useRouter } from 'next/navigation'

export function TenantSwitcher({
    activeTenant,
    availableTenants
}: {
    activeTenant: any,
    availableTenants: any[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const handleSwitch = async (tenantId: string) => {
        setIsOpen(false)
        await setActiveTenant(tenantId)
    }

    const handleCreateNew = () => {
        setIsOpen(false)
        router.push('/onboarding')
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
                <span className="truncate">{activeTenant.businessName}</span>
                <ChevronsUpDown className="w-4 h-4 ml-2 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                        Your Businesses
                    </div>
                    <ul className="py-1">
                        {availableTenants.map((t) => (
                            <li key={t.id}>
                                <button
                                    onClick={() => handleSwitch(t.id)}
                                    className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                    <span className="flex-1 truncate">{t.businessName}</span>
                                    {t.id === activeTenant.id && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {availableTenants.length < 2 && (
                        <div className="border-t border-gray-100">
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center w-full px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create New Business
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
