// Подключает интерактивную галерею к серверной странице маршрута.

import PlacesGallery from "./_components/PlacesGallery";

// Объявляем основной компонент этого файла.
export default function GalleryPage() {
  // Возвращаем JSX-разметку, которую React выведет на странице.
  return (
    <main className="container">
      <h1 className="title">Галерея и карта</h1>
      <p className="subtitle">
        Где купить игры из каталога: карточки магазинов, модальное окно и
        интерактивная карта
      </p>
      <PlacesGallery />
    </main>
  );
}
