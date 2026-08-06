'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  createClinicService,
  updateClinicService,
  deleteClinicService,
  loadServicesFromTemplate,
} from './actions'

interface ClinicService {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  clinic_services?: ClinicService[];
}

export default function ServicesTab({ clinicId, initialData, locale }: { clinicId: string, initialData: ServiceCategory[], locale: string }) {
  const [cats, setCats] = useState<ServiceCategory[]>(initialData)
  const [openCat, setOpenCat] = useState(false)
  const [openSvc, setOpenSvc] = useState(false)
  const [editCat, setEditCat] = useState<ServiceCategory | null>(null)
  const [editSvc, setEditSvc] = useState<ClinicService | null>(null)
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
    categoriesDesc: isAr ? 'تنظيم خدماتك (مثل: كشف وفحص، علاجات).' : 'Group your services (e.g., Examinations, Treatments).',
    addCategory: isAr ? 'إضافة فئة' : 'Add Category',
    editCategory: isAr ? 'تعديل الفئة' : 'Edit Category',
    categoryName: isAr ? 'اسم الفئة' : 'Category Name',
    orderIndex: isAr ? 'ترتيب' : 'Order Index',
    saveCategory: isAr ? 'حفظ الفئة' : 'Save Category',
    noCategories: isAr ? 'لم تُضف فئات بعد.' : 'No categories added yet.',
    saving: isAr ? 'جاري الحفظ...' : 'Saving...',
    services: isAr ? 'الخدمات' : 'Services',
    servicesDesc: isAr ? 'الخدمات المقدمة للمرضى. يمكنك تعديل الأسعار والمدة والحذف.' : 'Individual services offered to patients. You can edit prices, duration and delete.',
    addService: isAr ? 'إضافة خدمة' : 'Add Service',
    editService: isAr ? 'تعديل الخدمة' : 'Edit Service',
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
    edit: isAr ? 'تعديل' : 'Edit',
    delete: isAr ? 'حذف' : 'Delete',
    saved: isAr ? 'تم الحفظ بنجاح' : 'Saved successfully',
    deletedCategory: isAr ? 'تم حذف الفئة' : 'Category deleted',
    deletedService: isAr ? 'تم حذف الخدمة' : 'Service deleted',
    deleteCategoryConfirm: (n: string) => isAr
      ? `حذف الفئة "${n}"؟ لا يمكن حذف فئة بها خدمات.`
      : `Delete category "${n}"? A category with services cannot be deleted.`,
    deleteServiceConfirm: (n: string) => isAr
      ? `حذف الخدمة "${n}"؟`
      : `Delete service "${n}"?`,
    categoryHasServices: isAr ? 'لا يمكن حذف فئة تحتوي على خدمات. احذف الخدمات أولاً.' : 'Cannot delete a category that has services. Delete its services first.',
  }

  const handleCatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const created = await createServiceCategory(clinicId, formData)
      if (created) {
        setCats(prev => [...prev, {
          id: created.id,
          name: formData.get('name') as string,
          clinic_services: []
        }])
      }
      setOpenCat(false)
      toast.success(t.saved)
    } catch (err: any) {
      toast.error(err?.message || t.failedCategory)
    } finally {
      setLoading(false)
    }
  }

  const handleCatEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editCat) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const updated = await updateServiceCategory(clinicId, formData)
      if (updated) {
        setCats(prev => prev.map(c => c.id === editCat.id
          ? { ...c, name: formData.get('name') as string, order_index: parseInt(formData.get('order_index') as string) || 0 }
          : c))
      }
      setEditCat(null)
      toast.success(t.saved)
    } catch (err: any) {
      toast.error(err?.message || t.failedCategory)
    } finally {
      setLoading(false)
    }
  }

  const handleCatDelete = async (cat: ServiceCategory) => {
    if ((cat.clinic_services?.length || 0) > 0) {
      toast.error(t.categoryHasServices)
      return
    }
    if (!confirm(t.deleteCategoryConfirm(cat.name))) return
    setLoading(true)
    try {
      await deleteServiceCategory(clinicId, cat.id)
      setCats(prev => prev.filter(c => c.id !== cat.id))
      toast.success(t.deletedCategory)
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في حذف الفئة' : 'Failed to delete category'))
    } finally {
      setLoading(false)
    }
  }

  const handleSvcSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const created = await createClinicService(clinicId, formData)
      if (created) {
        const category_id = formData.get('category_id') as string
        const svc: ClinicService = {
          id: created.id,
          name: formData.get('name') as string,
          description: (formData.get('description') as string) || '',
          price: parseFloat(formData.get('price') as string) || 0,
          duration_minutes: parseInt(formData.get('duration_minutes') as string) || 30,
        }
        setCats(prev => prev.map(c => c.id === category_id
          ? { ...c, clinic_services: [...(c.clinic_services || []), svc] }
          : c))
      }
      setOpenSvc(false)
      toast.success(t.saved)
    } catch (err: any) {
      toast.error(err?.message || t.failedService)
    } finally {
      setLoading(false)
    }
  }

  const handleSvcEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editSvc) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const updated = await updateClinicService(clinicId, formData)
      if (updated) {
        const newCatId = formData.get('category_id') as string
        const svc: ClinicService = {
          id: updated.id,
          name: formData.get('name') as string,
          description: (formData.get('description') as string) || '',
          price: parseFloat(formData.get('price') as string) || 0,
          duration_minutes: parseInt(formData.get('duration_minutes') as string) || 30,
        }
        setCats(prev => {
          const without = prev.map(c => ({
            ...c,
            clinic_services: (c.clinic_services || []).filter(s => s.id !== svc.id)
          }))
          return without.map(c => c.id === newCatId
            ? { ...c, clinic_services: [...(c.clinic_services || []), svc] }
            : c)
        })
      }
      setEditSvc(null)
      toast.success(t.saved)
    } catch (err: any) {
      toast.error(err?.message || t.failedService)
    } finally {
      setLoading(false)
    }
  }

  const handleSvcDelete = async (catId: string, svc: ClinicService) => {
    if (!confirm(t.deleteServiceConfirm(svc.name))) return
    setLoading(true)
    try {
      await deleteClinicService(clinicId, svc.id)
      setCats(prev => prev.map(c => c.id === catId
        ? { ...c, clinic_services: (c.clinic_services || []).filter(s => s.id !== svc.id) }
        : c))
      toast.success(t.deletedService)
    } catch (err: any) {
      toast.error(err?.message || (isAr ? 'فشل في حذف الخدمة' : 'Failed to delete service'))
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
          {cats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCategories}</p>
          ) : (
            <div className="space-y-2">
              {cats.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-md">
                  <p className="font-medium">{cat.name}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCat(cat)}
                    >
                      {t.edit}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCatDelete(cat)}
                      disabled={loading}
                    >
                      {t.delete}
                    </Button>
                  </div>
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
            {cats.length === 0 && (
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
                <Button disabled={cats.length === 0}>{t.addService}</Button>
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
                      {cats.map(cat => (
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
            {cats.map((cat) => (
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
                          <p className="text-sm text-muted-foreground">
                            {svc.duration_minutes} {isAr ? 'دقيقة' : 'mins'}
                            {svc.description ? ` — ${svc.description}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{svc.price} EGP</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditSvc(svc)}
                          >
                            {t.edit}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleSvcDelete(cat.id, svc)}
                            disabled={loading}
                          >
                            {t.delete}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editCategory}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCatEdit} className="space-y-4">
            <input type="hidden" name="id" defaultValue={editCat?.id || ''} />
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">{t.categoryName}</Label>
              <Input id="edit-cat-name" name="name" defaultValue={editCat?.name || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-order">{t.orderIndex}</Label>
              <Input id="edit-cat-order" name="order_index" type="number" defaultValue={0} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.saving : t.saveCategory}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editSvc} onOpenChange={(o) => !o && setEditSvc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editService}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSvcEdit} className="space-y-4">
            <input type="hidden" name="id" defaultValue={editSvc?.id || ''} />
            <div className="space-y-2">
              <Label htmlFor="edit-svc-category">{t.category}</Label>
              <select id="edit-svc-category" name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required defaultValue={(() => {
                const cat = cats.find(c => (c.clinic_services || []).some(s => s.id === editSvc?.id))
                return cat?.id || ''
              })()}>
                <option value="" disabled>{t.selectCategory}</option>
                {cats.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-svc-name">{t.serviceName}</Label>
              <Input id="edit-svc-name" name="name" defaultValue={editSvc?.name || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-svc-desc">{t.description}</Label>
              <Input id="edit-svc-desc" name="description" defaultValue={editSvc?.description || ''} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-svc-price">{t.price}</Label>
                <Input id="edit-svc-price" name="price" type="number" step="0.01" defaultValue={editSvc?.price ?? 0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-svc-duration">{t.duration}</Label>
                <Input id="edit-svc-duration" name="duration_minutes" type="number" defaultValue={editSvc?.duration_minutes ?? 30} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.saving : t.saveService}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
