import React from 'react';
import './App.css';
import './image-gallery.scss';
import ReactDOM from 'react-dom';
import ImageGallery from 'react-image-gallery';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      showIndex: true,
      showBullets: true,
      infinite: true,
      showThumbnails: true,
      showFullscreenButton: true,
      showGalleryFullscreenButton: true,
      showPlayButton: true,
      showGalleryPlayButton: true,
      isRTL: false,
      slideDuration: 450,
      slideInterval: 2000,
      thumbnailPosition: 'bottom',
    };

    this.images = [
      {
        original: process.env.PUBLIC_URL + '/static/image_set_default.jpg',
        thumbnail: process.env.PUBLIC_URL +'/static/image_set_thumb.jpg',
        imageSet: [
          {
            srcSet: process.env.PUBLIC_URL + '/static/image_set_cropped.jpg',
            media : '(max-width: 1280px)',
          },
          {
            srcSet: process.env.PUBLIC_URL + '/static/image_set_default.jpg',
            media : '(min-width: 1280px)',
          }
        ]
      },
      {
        original: process.env.PUBLIC_URL + '/static/1.jpg',
        thumbnail: process.env.PUBLIC_URL + '/static/1t.jpg',
        originalClass: 'featured-slide',
        thumbnailClass: 'featured-thumb',
        description: 'Custom class for slides & thumbnails'
      },
    ].concat(this._getStaticImages());
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.slideInterval !== prevState.slideInterval ||
        this.state.slideDuration !== prevState.slideDuration) {
      // refresh setInterval
      this._imageGallery.pause();
      this._imageGallery.play();
    }
  }

  _onImageClick(event) {
    console.debug('clicked on image', event.target, 'at index', this._imageGallery.getCurrentIndex());
  }

  _onImageLoad(event) {
    console.debug('loaded image', event.target.src);
  }

  _onPause(index) {
    console.debug('paused on index', index);
  }

  _onScreenChange(fullScreenElement) {
    console.debug('isFullScreen?', !!fullScreenElement);
  }

  _onPlay(index) {
    console.debug('playing from index', index);
  }

  _handleInputChange(state, event) {
    this.setState({[state]: event.target.value});
  }

  _handleCheckboxChange(state, event) {
    this.setState({[state]: event.target.checked});
  }

  _handleThumbnailPositionChange(event) {
    this.setState({thumbnailPosition: event.target.value});
  }

  _getStaticImages() {
    let images = [];
    for (let i = 2; i <= 12; i++) {
      images.push({
        original: process.env.PUBLIC_URL + '/static/' + i + '.jpg',
        thumbnail:process.env.PUBLIC_URL + '/static/' + i + 't.jpg'
      });
    }

    return images;
  }

  
   render() {
    return (

      <section className='app'>
        <ImageGallery
          ref={i => this._imageGallery = i}
          items={this.images}
          lazyLoad={false}
          onClick={this._onImageClick.bind(this)}
          onImageLoad={this._onImageLoad}
          onPause={this._onPause.bind(this)}
          onScreenChange={this._onScreenChange.bind(this)}
          onPlay={this._onPlay.bind(this)}
          infinite={this.state.infinite}
          showBullets={this.state.showBullets}
          showFullscreenButton={this.state.showFullscreenButton && this.state.showGalleryFullscreenButton}
          showPlayButton={this.state.showPlayButton && this.state.showGalleryPlayButton}
          showThumbnails={this.state.showThumbnails}
          showIndex={this.state.showIndex}
          isRTL={this.state.isRTL}
          thumbnailPosition={this.state.thumbnailPosition}
          slideDuration={parseInt(this.state.slideDuration)}
          slideInterval={parseInt(this.state.slideInterval)}
          additionalClass="app-image-gallery"
        />

        <div className='app-sandbox'>

          <div className='app-sandbox-content'>
            <h2 className='app-header'>Settings</h2>

            <ul className='app-buttons'>
              <li>
                <div className='app-interval-input-group'>
                  <span className='app-interval-label'>Play Interval</span>
                  <input
                    className='app-interval-input'
                    type='text'
                    onChange={this._handleInputChange.bind(this, 'slideInterval')}
                    value={this.state.slideInterval}/>
                </div>
              </li>

              <li>
                <div className='app-interval-input-group'>
                  <span className='app-interval-label'>Slide Duration</span>
                  <input
                    className='app-interval-input'
                    type='text'
                    onChange={this._handleInputChange.bind(this, 'slideDuration')}
                    value={this.state.slideDuration}/>
                </div>
              </li>

              <li>
                <div className='app-interval-input-group'>
                  <span className='app-interval-label'>Thumbnail Bar Position</span>
                  <select
                    className='app-interval-input'
                    value={this.state.thumbnailPosition}
                    onChange={this._handleThumbnailPositionChange.bind(this)}
                  >
                    <option value='bottom'>Bottom</option>
                    <option value='top'>Top</option>
                    <option value='left'>Left</option>
                    <option value='right'>Right</option>
                  </select>
                </div>
              </li>
            </ul>

            <ul className='app-checkboxes'>
              <li>
                <input
                  id='infinite'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'infinite')}
                  checked={this.state.infinite}/>
                  <label htmlFor='infinite'>allow infinite sliding</label>
              </li>
              <li>
                <input
                  id='show_fullscreen'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'showFullscreenButton')}
                  checked={this.state.showFullscreenButton}/>
                  <label htmlFor='show_fullscreen'>show fullscreen button</label>
              </li>
              <li>
                <input
                  id='show_playbutton'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'showPlayButton')}
                  checked={this.state.showPlayButton}/>
                  <label htmlFor='show_playbutton'>show play button</label>
              </li>
              <li>
                <input
                  id='show_bullets'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'showBullets')}
                  checked={this.state.showBullets}/>
                  <label htmlFor='show_bullets'>show bullets</label>
              </li>
              <li>
                <input
                  id='show_thumbnails'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'showThumbnails')}
                  checked={this.state.showThumbnails}/>
                  <label htmlFor='show_thumbnails'>show thumbnails</label>
              </li>
              <li>
                <input
                  id='show_index'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'showIndex')}
                  checked={this.state.showIndex}/>
                  <label htmlFor='show_index'>show index</label>
              </li>
              <li>
                <input
                  id='is_rtl'
                  type='checkbox'
                  onChange={this._handleCheckboxChange.bind(this, 'isRTL')}
                  checked={this.state.isRTL}/>
                  <label htmlFor='is_rtl'>is right to left</label>
              </li>
              
            </ul>
          </div>

        </div>
      </section>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('container'));

export default App;
