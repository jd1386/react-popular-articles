import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

const Tabs = props => {
  const { categories, currentCategory, changeCurrentCategory } = props;

  return (
    <>
      <ul className="nav nav-pills nav-justified">
        {categories.map(category => {
          let btnClassName;

          category.name === currentCategory
            ? (btnClassName = 'btn-primary')
            : (btnClassName = 'btn-outline-primary');

          return (
            <li className="nav-item active p-1" key={category.id}>
              <button
                className={`btn ${btnClassName} btn-block`}
                onMouseEnter={() => changeCurrentCategory(category.name)}
              >
                {category.name}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const Articles = props => {
  const { articles } = props;

  return (
    <div className="list-group">
      {articles.map(article => (
        <div
          className="list-group-item list-group-item-action"
          key={article.id}
        >
          <small>article #{article.id}</small>
          <div className="mb-1">{article.title}</div>
        </div>
      ))}
    </div>
  );
};

const Button = ({ loadMoreArticles }) => (
  <div className="mt-3">
    <button
      className="btn btn-outline-dark btn-sm mr-2"
      onClick={() => loadMoreArticles('prev')}
    >
      <i className="fas fa-angle-left" />
    </button>
    <button
      className="btn btn-outline-dark btn-sm"
      onClick={() => loadMoreArticles('next')}
    >
      <i className="fas fa-angle-right" />
    </button>
  </div>
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allArticles: [],
      currentCategory: '정치',
      currentArticles: [],
      currentPage: 1
    };
    this.articlesPerPage = 5;
    this.categories = [
      {
        id: 1,
        name: '정치'
      },
      {
        id: 2,
        name: '경제'
      },
      {
        id: 3,
        name: '사회'
      }
    ];
  }

  async componentDidMount() {
    const req = await axios.get('https://koreanjson.com/posts');
    const allArticles = req.data;

    this.setState({
      allArticles,
      currentArticles: allArticles
        .filter(article => article.UserId === 1)
        .slice(0, this.articlesPerPage)
    });
  }

  loadMoreArticles = direction => {
    const { allArticles, currentCategory } = this.state;
    const currentCategoryId = this.categories.find(
      category => category.name === currentCategory
    ).id;
    const currentCategoryArticles = allArticles.filter(
      article => article.UserId === currentCategoryId
    );

    const pagedArticles = page => {
      const lastIndex = page * this.articlesPerPage;
      const firstIndex = lastIndex - this.articlesPerPage;
      return currentCategoryArticles.slice(firstIndex, lastIndex);
    };

    const getLastPage = () =>
      Math.floor(currentCategoryArticles.length / this.articlesPerPage);

    // eslint-disable-next-line default-case
    switch (direction) {
      case 'prev':
        this.setState(prevState => {
          if (prevState.currentPage === 1) {
            return {
              currentPage: getLastPage(),
              currentArticles: pagedArticles(getLastPage())
            };
          } else {
            return {
              currentPage: prevState.currentPage - 1,
              currentArticles: pagedArticles(prevState.currentPage - 1)
            };
          }
        });
        break;

      case 'next':
        this.setState(prevState => {
          if (prevState.currentPage === getLastPage()) {
            return {
              currentPage: 1,
              currentArticles: pagedArticles(1)
            };
          } else {
            return {
              currentPage: prevState.currentPage + 1,
              currentArticles: pagedArticles(prevState.currentPage + 1)
            };
          }
        });
        break;
    }
  };

  changeCurrentCategory = userSelectedCategory => {
    const { allArticles } = this.state;
    const category = this.categories.find(
      category => category.name === userSelectedCategory
    );

    this.setState({
      currentCategory: category.name,
      currentArticles: allArticles
        .filter(post => post.UserId === category.id)
        .slice(0, this.articlesPerPage),
      currentPage: 1
    });
  };

  render() {
    const { currentArticles, currentCategory } = this.state;

    return (
      <div className="App">
        <Tabs
          categories={this.categories}
          currentCategory={currentCategory}
          changeCurrentCategory={this.changeCurrentCategory}
        />
        <Articles articles={currentArticles} />
        <Button loadMoreArticles={this.loadMoreArticles} />
      </div>
    );
  }
}

export default App;
