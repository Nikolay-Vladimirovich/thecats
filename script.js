window.addEventListener("load", function () {

  const cats = new Cats(); // Создаем экземпляр класса
  const menuItems = document.querySelectorAll('nav a');
  let catsContent = document.querySelectorAll('.cats_content');
  //catsContent.forEach((item) => { item.classList.add('closed') });
  // Прячем блоки со списками котов, чтобы затем
  // показать како-либо один в зависимости от нажатого пункта меню
  
  menuItems.forEach((item) => { // Перебираем все пункты меню
    
    item.addEventListener('click', function(e){

      e.preventDefault();

      menuItems.forEach((item)=>(item.classList.remove('active'))); // Удаляем класс active у всех ссылок в меню
      this.classList.add('active'); // Добавляем класс active к выбранному пункту
      
      catsContent.forEach((item)=> item.classList.remove('opened'));
      document.querySelector('.' + this.dataset.page).classList.add('opened')


    });
    
  });
  menuItems[0].click(); // Генерируем клик по первому пункту меню

});