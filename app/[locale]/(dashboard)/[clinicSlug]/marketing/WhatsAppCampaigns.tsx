'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import NewWhatsAppCampaignDialog from './NewWhatsAppCampaignDialog'

export default function WhatsAppCampaigns({ 
  clinicId, 
  locale,
  campaigns 
}: { 
  clinicId: string, 
  locale: string,
  campaigns: any[] 
}) {
  const isAr = locale === 'ar'
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{isAr ? 'حملات واتساب' : 'WhatsApp Campaigns'}</CardTitle>
          <CardDescription>{isAr ? 'حملات رسائل واتساب الجماعية' : 'Bulk WhatsApp messaging campaigns'}</CardDescription>
        </div>
        <NewWhatsAppCampaignDialog clinicId={clinicId} locale={locale} />
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{isAr ? 'لا توجد حملات واتساب بعد.' : 'No WhatsApp campaigns yet.'}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? 'اسم الحملة' : 'Campaign Name'}</TableHead>
                <TableHead>{isAr ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                <TableHead>{isAr ? 'المُستلمون' : 'Recipients'}</TableHead>
                <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(camp => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium">{camp.name}</TableCell>
                  <TableCell>{new Date(camp.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    
                    {camp.whatsapp_campaign_recipients?.[0]?.count || 0}
                  </TableCell>
                  <TableCell>
                    {camp.status === 'completed' && <Badge className="bg-green-100 text-green-800" variant="secondary">{isAr ? 'تم الإرسال' : 'Completed'}</Badge>}
                    {camp.status === 'processing' && <Badge className="bg-blue-100 text-blue-800" variant="secondary">{isAr ? 'قيد المعالجة' : 'Processing'}</Badge>}
                    {camp.status === 'draft' && <Badge variant="secondary">{isAr ? 'مسودة' : 'Draft'}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
