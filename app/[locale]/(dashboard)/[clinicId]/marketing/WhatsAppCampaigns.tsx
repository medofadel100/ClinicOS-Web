'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>WhatsApp Broadcasts</CardTitle>
          <CardDescription>Send targeted promotional messages to your patients.</CardDescription>
        </div>
        <NewWhatsAppCampaignDialog clinicId={clinicId} locale={locale} />
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No WhatsApp campaigns found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(camp => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium">{camp.name}</TableCell>
                  <TableCell>{new Date(camp.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {/* @ts-expect-error type inference */}
                    {camp.whatsapp_campaign_recipients?.[0]?.count || 0}
                  </TableCell>
                  <TableCell>
                    {camp.status === 'completed' && <Badge className="bg-green-100 text-green-800" variant="secondary">Completed</Badge>}
                    {camp.status === 'processing' && <Badge className="bg-blue-100 text-blue-800" variant="secondary">Processing</Badge>}
                    {camp.status === 'draft' && <Badge variant="secondary">Draft</Badge>}
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
