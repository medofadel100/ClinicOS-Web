'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createServiceCategory, createClinicService } from './actions'

interface ClinicService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  clinic_services?: ClinicService[];
}

export default function ServicesTab({ clinicId, initialData }: { clinicId: string, initialData: ServiceCategory[] }) {
  const [openCat, setOpenCat] = useState(false)
  const [openSvc, setOpenSvc] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createServiceCategory(clinicId, formData)
      setOpenCat(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleSvcSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createClinicService(clinicId, formData)
      setOpenSvc(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Service Categories</CardTitle>
            <CardDescription>Group your services (e.g., General Dentistry, Orthodontics).</CardDescription>
          </div>
          <Dialog open={openCat} onOpenChange={setOpenCat}>
            {/* @ts-expect-error shadcn primitive issue */}
            <DialogTrigger asChild>
              <Button>Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCatSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">Order Index</Label>
                  <Input id="order_index" name="order_index" type="number" defaultValue={0} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Category'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {initialData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories added yet.</p>
          ) : (
            <div className="space-y-2">
              {initialData.map((cat) => (
                <div key={cat.id} className="p-3 border rounded-md">
                  <p className="font-medium">{cat.name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>Individual services offered to patients.</CardDescription>
          </div>
          <Dialog open={openSvc} onOpenChange={setOpenSvc}>
            {/* @ts-expect-error shadcn primitive issue */}
            <DialogTrigger asChild>
              <Button disabled={initialData.length === 0}>Add Service</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSvcSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <select id="category_id" name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Select a category</option>
                    {initialData.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (EGP)</Label>
                    <Input id="price" name="price" type="number" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (mins)</Label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={30} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Service'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {initialData.map((cat) => (
              <div key={cat.id}>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">{cat.name}</h4>
                {cat.clinic_services?.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-4">No services.</p>
                ) : (
                  <div className="space-y-2 pl-4">
                    {cat.clinic_services?.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{svc.name}</p>
                          <p className="text-sm text-muted-foreground">{svc.duration_minutes} mins</p>
                        </div>
                        <div className="font-semibold">{svc.price} EGP</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
