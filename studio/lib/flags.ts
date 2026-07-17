/*
  Фича-флаги. Секция отзывов держится СКРЫТОЙ до разрешения авторов на публикацию
  и подписи (Ф4). Владелец включает вручную, заменив false → true, после того как
  реальные отзывы и согласия внесены в components/pg/Testimonials.tsx.
*/
export const FLAGS = {
  showTestimonials: false,
} as const;
