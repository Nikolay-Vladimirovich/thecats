window.addEventListener("load", function () {

  const cats = new Cats();

  const menuItems = document.querySelectorAll('nav a');

  let catsContent = document.querySelectorAll('.cats_content');
  catsContent.forEach((item) => { item.classList.add('closed') });
  
  menuItems.forEach((item, i, arr) => {
    
    item.addEventListener('click', function(){

      menuItems.forEach((item)=>(item.classList.remove('active')));
      this.classList.add('active');
      
      catsContent.forEach((item)=> item.classList.add('closed'));
      document.querySelector('.' + this.dataset.page).classList.remove('closed')


    });
    
  });
  menuItems[0].click(); // Генерируем клик по первому пункту меню

});