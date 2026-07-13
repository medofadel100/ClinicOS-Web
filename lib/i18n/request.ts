import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales: string[] = ['en', 'ar'];

export default getRequestConfig(async ({locale}) => {
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
