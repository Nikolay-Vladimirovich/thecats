class Cats {
  elSearchedList = '#cats_searched';
  elFavourite = '#cats_liked';
  elLoader = '.cats_loader';
  loaderTimeout = 2000; // Время затухания лоадера
  elMenu = '.menu';

  constructor() {
    this.limit = 1;
    this.images = [];
    this.favourites = [];
    this.page = 1;
    this.pagination_count = 0;
    this.error_message = null;

    this.loader = document.querySelector(this.elLoader);

    this.menu = document.querySelector(this.elMenu);
    this.currentContent = this.elSearchedList; // Текущий пункт меню
    this.contentDimension = [ // Массив для запоминания позиций скролла для каждого пункта меню
      {
        'id': this.elSearchedList,
        'scrollTop': 0
      },
      {
        'id': this.elFavourite,
        'scrollTop': 0
      }
    ]
    this.initCats();
  }

  initCats() {
    axios.defaults.headers.common['x-api-key'] = "d6563ba1-1e8f-4a08-b218-1b8b3419d02d";

    if (!localStorage.getItem('catsLiked')) { // СОздаем переменную в хранилище, если такой еще нету
      localStorage.setItem('catsLiked', '[]')
    }
    this.renderSearchedList();
    this.renderFavourites();
    this.listenScrolling();
    this.listenWindowResizing();
  }

  getCurrentContent(el) {
    const a = this.contentDimension.find(aC => aC.id === el);
    return a;
  }

  setCurrentContent(el) {
    this.currentContent = el;
    this.contentDimension.id = el;
    window.scrollTo({ // Прокруучиваем скролл до прежней позиции
      top: this.getCurrentContent(el).scrollTop,
      behavior: "smooth"
    });
    this.infinityAppend();    
    // Принудительно продолжаем загрузку картинок, если перескачили на другой пункт до окончания подгрузки картинок
  }

  infinityAppend() { // Метод добавления картинок до тех пор пока вмещается в окно :)
    let a = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    let b = window.innerHeight;
    let c = window.pageYOffset + 10; // "+ 10" - это временный фикс для мобильных устройств
    //document.querySelector('.mcli').innerHTML = a + '  |||  ' + b + '  |||  ' + c  ;
    if (a <= (b + c)) {
      if (this.contentDimension.id == this.elSearchedList) {
        // Проверяем, если находимся в пункте "Все котики", то добавляем элементы по "скроллу" либо "ресайзу"
        // Если же находимся в "избранных котах", то ничег не добавляем по этим событиям.
        this.renderSearchedList();
      }
      // При достижения самого низа документа
      // Либо увеличении высоты окна
      // подгружаем еще котов по столько
      // по сколько указано в this.limit в кострукторе класса
      // пока высота документа не станет больше высоты окна
    }
  }

  listenScrolling() { // Добавление картинок при скролле

    let ctx = this; // Присвоение контеста, пригодится далее
    // Оптимизация производительности через техники throttle and debounce
    let scrollLastCall = 0;
    let scrollTimeout;
    let scrollFinishDelay = 150;

    let a = this.getCurrentContent(this.currentContent);

    window.addEventListener('scroll', function (e) {
      // throttle
      let now = Date.now();
      if (now > scrollLastCall + scrollFinishDelay) {
        onScroll(e);
        scrollLastCall = now;
      }
      // debounce
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        onScroll(e);
      }, scrollFinishDelay);
    });

    
    function onScroll(e) {
      ctx.getCurrentContent(ctx.currentContent).scrollTop = window.pageYOffset;
      // Записываем в contentDimension[текущего обекта].scrollTop позицию скролла, чтобы просмотр
      //продолжался с этой позиции при следующем открытии этого же пункта меню.

      //console.log(ctx.getCurrentContent(ctx.currentContent));
      ctx.infinityAppend();
      // Подгружаем картинки при скролле окна
    }
  }

  listenWindowResizing() { // Добавление картинок при изменении размеров окна
    let ctx = this;
    // Оптимизация производительности через техники throttle and debounce
    let resizeLastCall = 0;
    let resizeTimeout;
    let resizeFinishDelay = 150;
    window.addEventListener('resize', function (e) {
      // throttle
      let now = Date.now();
      if (now > resizeLastCall + resizeFinishDelay) {
        onResize(e);
        resizeLastCall = now;
      }
      // debounce
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        onResize(e);
      }, resizeFinishDelay);
    });

    function onResize(e) {
      ctx.infinityAppend(); // Подгружаем картинки при увеличении высоты окна
    }
  }

  /* Отрисовка найденных через catapi элементов */
  renderSearchedList() {
    this.loader.classList.add('opened'); // Показываем идикатор загрузки картинок

    let cats = new Promise((resolve, reject) => {
      resolve(this.getImages()); // Обращение к api
    });
    cats.then(() => {
      this.buildSearchedList(this.images, this.elSearchedList);

    }).then(() => {
      this.infinityAppend(this);

    }).then(() => setTimeout(() => this.loader.classList.remove('opened'), this.loaderTimeout));
    // Прячем идикатор загрузки картинок, через loaderTimeout мс
  }

  /* Отрисовка избранных котов */
  renderFavourites() {
    let cats = new Promise((resolve, reject) => {
      resolve(this.getFavourites());
    });
    cats.then(
      () => this.buildFavourites(
        JSON.parse(localStorage.getItem('catsLiked')), // Получаем строку из localStorage и парсим её в объект
        this.elFavourite
      )
    )
  }

  buildSearchedList(images, el) {
    images.forEach((item) => {
      let cat = document.createElement("div");
      let image = new Image();
      let catToolbar = document.createElement("div");
      let btnLike = document.createElement("button");
      cat.classList.add("cat")
      cat.appendChild(image);
      image.src = item.url;
      image.dataset.uniqueid = item.id;
      cat.appendChild(catToolbar).classList.add("cat__toolbar");
      catToolbar.appendChild(btnLike).classList.add("btn__like");
      btnLike.addEventListener('click', () => {
        this.favouriteImage(image.dataset.uniqueid);
        btnLike.classList.add("active")
      });
      document.querySelector(el).appendChild(cat);
    });
  }

  buildFavourites(images, el) {
    document.querySelector(el).innerHTML = '';
    images.forEach((item) => {
      let cat = document.createElement("div");
      let image = new Image();
      let catToolbar = document.createElement("div");
      let btnLike = document.createElement("button");
      cat.classList.add("cat")
      cat.appendChild(image);
      cat.appendChild(catToolbar).classList.add("cat__toolbar");
      image.dataset.uniqueid = item.id; image.src = item.image.url;
      catToolbar.appendChild(btnLike).classList.add("btn__like", "active");
      btnLike.addEventListener('click', () => this.deleteFavouriteImage(image.dataset.uniqueid))
      document.querySelector(el).appendChild(cat);
    })
  }


  async getFavourites() {
    try {
      let query_params = {
        limit: 0,
        order: 'DESC' // Если указать 'DESC', то вначале списка будет последний добавленный. Очень удобно.
      }
      let response = await axios.get('https://api.thecatapi.com/v1/favourites', { params: query_params })
      this.favourites = response.data

      localStorage.setItem('catsLiked', JSON.stringify(this.favourites));
      // Заносим в localStorage строку, полученную из массива с избранными котами

      this.pagination_count = response.headers['pagination-count'];
      this.clearError();
    } catch (err) {
      console.log(err)
    }
  }

  async getImages() {
    try {
      let query_params = {
        limit: this.limit
      }
      let response = await axios.get('https://api.thecatapi.com/v1/images/search', { params: query_params });
      this.images = response.data;
    } catch (err) {
      console.log(err);
    }
  }

  async favouriteImage(image_id) {

    try {
      let post_body = {
        image_id: image_id,
        sub_id: "User-1"
      }
      let response = await axios.post('https://api.thecatapi.com/v1/favourites', post_body)
      this.page = 1;
      this.renderFavourites(); // Отрисовка списка избранных котов после нажатия сердечка (добавить в избранное)
    } catch (error) {
      console.log(error)
      this.error_message = error.response.data.message
    }
  }
  async deleteFavouriteImage(favourite_id) {
    try {
      let response = await axios.delete('https://api.thecatapi.com/v1/favourites/' + favourite_id)
      this.favourites = response.data
      this.page = 1;
      this.renderFavourites(); // Отрисовка списка избранных котов после нажатия сердечка (удалить из избранного)
    } catch (err) {
      console.log(err)
    }
  }

  async clearError() {
    this.error_message = null;
  }

}