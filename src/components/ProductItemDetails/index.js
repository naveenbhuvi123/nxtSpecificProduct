import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import SimilarProductItem from '../SimilarProductItem'
import Header from '../Header'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productDetails: {},
    similarProductDetails: [],
    apiStatus: apiStatusConstants.initial,
    quantity: 1,
  }

  componentDidMount() {
    this.getProducts()
  }

  getFormattedData = data => ({
    imageUrl: data.image_url,
    id: data.id,
    title: data.title,
    price: data.price,
    description: data.description,
    brand: data.brand,
    totalReviews: data.total_reviews,
    rating: data.rating,
    availability: data.availability,
  })

  getProducts = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const apUrl = `https://apis.ccbp.in/products/${id}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedData = this.getFormattedData(data)
      const updatedSimilarProductData = data.similar_products.map(eachProduct =>
        this.getFormattedData(eachProduct),
      )
      this.setState({
        productDetails: updatedData,
        similarProductDetails: updatedSimilarProductData,
        apiStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 404) {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoadingView = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        className="failure-image"
        alt="failure view"
      />
      <h1 className="not-foundName"> Product Not Found</h1>
      <Link to="/products">
        <button className="button" type="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  onDecrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onIncrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  renderProductDetailsView = () => {
    const {productDetails, similarProductDetails, quantity} = this.state
    const {
      imageUrl,
      title,
      price,
      description,
      brand,
      totalReviews,
      rating,
      availability,
    } = productDetails
    return (
      <>
        <div className="product-Details-view">
          <div className="img-container">
            <img src={imageUrl} className="productImg" alt="product" />
          </div>
          <div className="product-details">
            <h1 className="product-name">{title}</h1>
            <p className="price">{price}</p>
            <div className="rating-container">
              <button type="button" className="button">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  className="rating-icon"
                  alt="star"
                />
              </button>
              <p className="review-text">{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <p className="stock-availability">
              <span className="highlight-text">Available</span>
              {availability}
            </p>
            <p className="stock-availability">
              <span className="highlight-text">Brand</span>
              {brand}
            </p>
            <hr className="line" />
            <div className="changes-section">
              <button
                className="icon"
                type="button"
                data-testid="minus"
                onClick={this.onDecrementQuantity}
                aria-label="Decrease Quantity"
              >
                <BsDashSquare className="quantity-controller-icon" />
              </button>
              <h1 className="quantity">{quantity}</h1>
              <button
                className="icon"
                type="button"
                data-testId="plus"
                onClick={this.onIncrementQuantity}
                aria-label="Increase Quantity"
              >
                <BsPlusSquare className="quantity-controller-icon" />
              </button>
            </div>

            <button className="button" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <div className="similar-product-section">
          <ul className="similar-products-list">
            {similarProductDetails.map(eachItem => (
              <SimilarProductItem ItemDetails={eachItem} key={eachItem.id} />
            ))}
          </ul>
        </div>
      </>
    )
  }

  renderAllProductDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView() // Implement this function
      case apiStatusConstants.failure:
        return this.renderFailureView() // Implement this function
      case apiStatusConstants.inProgress:
        return this.renderLoadingView() // Implement this function
      default:
        return null
    }
  }

  render() {
    return (
      <div className="ProductItem-container">
        <Header />
        <div>{this.renderAllProductDetails()}</div>
      </div>
    )
  }
}

export default ProductItemDetails
