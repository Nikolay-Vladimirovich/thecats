window.addEventListener("load", function () {

 

  const cats = new Cats(); // Создаем экземпляр класса
  const menu = document.querySelector('.menu');
  const menuItems = menu.querySelectorAll('.menu__link');
  const catsContent = document.querySelectorAll('.cats_content');

  menu.addEventListener('click', function(e){
		if(e.target.classList.contains('menu__link')){
			e.preventDefault();
			const link = e.target.hash; // По сути это id слоя, который будем показывать при клике на пункт меню

      this.querySelectorAll('.menu__link').forEach((item)=> item.classList.remove('active')); // Удаляем класс active у всех ссылок в меню
      e.target.classList.add('active');// Добавляем класс active к выбранному пункту меню
      
      catsContent.forEach((item)=> item.classList.remove('opened')); // Прячем все div с котами
      document.querySelector(link).classList.add('opened');
      // Путем навешивания класса opened показываем нужный div с id, который определили ранее в переменной link

      cats.setCurrentContent(link); // Передаем в экземпляр объекта аттрибут href из пункта меню.

		}

	});

  menuItems[0].click(); // Генерируем клик по пункту меню

});