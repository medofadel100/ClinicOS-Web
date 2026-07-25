'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createServiceCategory, createClinicService, loadServicesFromTemplate } from './actions'

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

export default function ServicesTab({ clinicId, initialData, locale }: { clinicId: string, initialData: ServiceCategory[], locale: string }) {
  const [openCat, setOpenCat] = useState(false)
  const [openSvc, setOpenSvc] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAr = locale === 'ar'
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  const handleLoadTemplate = async () => {
    const msg = isAr
      ? 'سيتم تحميل الخدمات المقترحة من القالب. هل أنت متأكد؟'
      : 'This will load suggested services from the template. Are you sure?'
    if (!confirm(msg)) return

    setLoadingTemplate(true)
    try {
      await loadServicesFromTemplate(clinicId, locale)
      window.location.reload()
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في التحميل' : 'Failed to load template'))
    } finally {
      setLoadingTemplate(false)
    }
  }

  const t = {
    serviceCategories: isAr ? 'فئات الخدمات' : 'Service Categories',
    categoriesDesc: isAr ? 'تنظيم خدماتك (مثل: طب عام، تقويم).' : 'Group your services (e.g., General Dentistry, Orthodontics).',
    addCategory: isAr ? 'إضافة فئة' : 'Add Category',
    categoryName: isAr ? 'اسم الفئة' : 'Category Name',
    orderIndex: isAr ? 'ترتيب' : 'Order Index',
    saveCategory: isAr ? 'حفظ الفئة' : 'Save Category',
    noCategories: isAr ? 'لم تُضف فئات بعد.' : 'No categories added yet.',
    saving: isAr ? 'جاري الحفظ...' : 'Saving...',
    services: isAr ? 'الخدمات' : 'Services',
    servicesDesc: isAr ? 'الخدمات المقدمة للمرضى.' : 'Individual services offered to patients.',
    addService: isAr ? 'إضافة خدمة' : 'Add Service',
    category: isAr ? 'الفئة' : 'Category',
    selectCategory: isAr ? 'اختر فئة...' : 'Select a category...',
    serviceName: isAr ? 'اسم الخدمة' : 'Service Name',
    description: isAr ? 'الوصف' : 'Description',
    price: isAr ? 'السعر (ج.م)' : 'Price (EGP)',
    duration: isAr ? 'المدة (دقيقة)' : 'Duration (mins)',
    saveService: isAr ? 'حفظ الخدمة' : 'Save Service',
    noServices: isAr ? 'لا توجد خدمات.' : 'No services.',
    failedCategory: isAr ? 'فشل في حفظ الفئة' : 'Failed to save category',
    failedService: isAr ? 'فشل في حفظ الخدمة' : 'Failed to save service',
  }

  const handleCatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createServiceCategory(clinicId, formData)
      setOpenCat(false)
    } catch (err) {
      toast.error(t.failedCategory)
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
      toast.error(t.failedService)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.serviceCategories}</CardTitle>
            <CardDescription>{t.categoriesDesc}</CardDescription>
          </div>
          <Dialog open={openCat} onOpenChange={setOpenCat}>
            
            <DialogTrigger asChild>
              <Button>{t.addCategory}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addCategory}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCatSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.categoryName}</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_index">{t.orderIndex}</Label>
                  <Input id="order_index" name="order_index" type="number" defaultValue={0} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.saving : t.saveCategory}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {initialData.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCategories}</p>
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
            <CardTitle>{t.services}</CardTitle>
            <CardDescription>{t.servicesDesc}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {initialData.length === 0 && (
              <Button
                variant="outline"
                onClick={handleLoadTemplate}
                disabled={loadingTemplate}
              >
                {loadingTemplate
                  ? (isAr ? 'جاري التحميل...' : 'Loading...')
                  : (isAr ? 'تحميل من القالب' : 'Load from Template')}
              </Button>
            )}
            <Dialog open={openSvc} onOpenChange={setOpenSvc}>
            
            <DialogTrigger asChild>
              <Button disabled={initialData.length === 0}>{t.addService}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.addService}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSvcSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">{t.category}</Label>
                  <select id="category_id" name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">{t.selectCategory}</option>
                    {initialData.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t.serviceName}</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t.description}</Label>
                  <Input id="description" name="description" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t.price}</Label>
                    <Input id="price" name="price" type="number" step="0.01" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">{t.duration}</Label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={30} required />
                  </div>
                </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t.saving : t.saveService}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {initialData.map((cat) => (
              <div key={cat.id}>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">{cat.name}</h4>
                {cat.clinic_services?.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-4">{t.noServices}</p>
                ) : (
                  <div className="space-y-2 pl-4">
                    {cat.clinic_services?.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{svc.name}</p>
                          <p className="text-sm text-muted-foreground">{svc.duration_minutes} {isAr ? 'دقيقة' : 'mins'}</p>
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
