class Cats {
  elSearchedList = ".cats_all";
  elFavourite = ".cats_liked";

  constructor() {
    this.limit = 15;
    this.images = [];
    this.favourites = [];

    this.page = 1;
    this.pagination_count = 0;
    this.error_message = null;

    this.initCat();
  }


  initCat() {
    axios.defaults.headers.common['x-api-key'] = "d6563ba1-1e8f-4a08-b218-1b8b3419d02d";

    if (!localStorage.getItem('catsLiked')) {
      localStorage.setItem('catsLiked', '[]')
    }

    this.renderSearchedList();
    this.renderFavourites();

  }

  renderSearchedList(){
    let cats = new Promise((resolve, reject) => {
      resolve(this.getImages());
    });
    cats.then(() => {
      this.buildSearchedList(this.images, this.elSearchedList);
    });
  }

  renderFavourites(){
    let cats = new Promise((resolve, reject) => {
      resolve(this.getFavourites());
    });
    cats.then(() => this.buildFavourites(JSON.parse(localStorage.getItem('catsLiked')), this.elFavourite))
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

      

      image.dataset.uniqueid = item.id;


      image.src = item.image.url;

      
      catToolbar.appendChild(btnLike).classList.add("btn__like", "active");

      btnLike.addEventListener('click', () => this.deleteFavouriteImage(image.dataset.uniqueid))

      document.querySelector(el).appendChild(cat);

    })

  }

  buildSearchedList(images, el) {

    document.querySelector(el).innerHTML = '';
    
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

      btnLike.addEventListener('click', () => this.favouriteImage(image.dataset.uniqueid))


      document.querySelector(el).appendChild(cat);

    });

  }


  async getFavourites() {
    try {

      let query_params = {
        limit: 100,
        order: 'DESC',
        page: this.page - 1,
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