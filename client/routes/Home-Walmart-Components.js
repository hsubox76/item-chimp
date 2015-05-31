var React = require('react');

// Component that displays related results from Walmart API
var WalmartRelatedResultsDisplay = React.createClass({
  handleReviewRequest: function(itemId, site, name, image) {
    this.props.onReviewRequest(itemId, site, name, image);
  },
  render: function() {
    var resultNodes = this.props.data.results.map(function(result, index) {

      result.shortDescription = result.shortDescription || 'n/a';

      return (
        <WalmartIndividualResultDisplay 
          key={'walmartResult' + index}
          name={result.name} 
          salePrice={result.salePrice}
          upc={result.upc} 
          shortDescription={result.shortDescription}
          thumbnailImage={result.thumbnailImage}
          customerRating={result.customerRating}
          numReviews={result.numReviews}
          customerRatingImage={result.customerRatingImage}
          itemId={result.itemId} 
          onReviewRequest={this.handleReviewRequest} />
      );
    }.bind(this));
    return (
      <div className="related-results-display">
        <h3>Walmart Related Results</h3>
        <h5>Click a product to compare reviews</h5>
        {resultNodes}
      </div>
    );
  }
});

// Component that displays an individual result for Walmart
var WalmartIndividualResultDisplay = React.createClass({
  handleReviewRequest: function() {
    this.props.onReviewRequest({itemId: this.props.itemId}, 'Walmart', this.props.name, this.props.thumbnailImage);
  },  
  render: function() {
    return (
      <div className="individual-display" onClick={this.handleReviewRequest}>
        <h5 className="product-name">
          {this.props.name}
        </h5>
        <img src={this.props.thumbnailImage} />
        <div className="sale-price-display">
          ${this.props.salePrice}
        </div>
        <div className="description-display">
          <strong>Description:</strong> {this.props.shortDescription}
        </div>
        <div>
          <strong>Rating:</strong> {this.props.customerRating} ({this.props.numReviews} reviews)
        </div>
        
        <img src={this.props.customerRatingImage} />
      </div>
    );
  }
});


module.exports.WalmartRelatedResultsDisplay = WalmartRelatedResultsDisplay;


