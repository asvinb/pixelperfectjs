/*
Pixel Perfect JS
===============
Helps you code perfect pixel precision
*/
/**
<div id="pixel-perfect-panel">
  <h2>Pixel Perfect JS</h2>
  <ul>
    <li>
        <h3>Enable </h3>
        <label for="pixel-perfect-enable-yes">Yes</label> <input type="radio" value="yes" name="pixel-perfect-enable" id="pixel-perfect-enable-yes" checked="checked" /> 
        <label for="pixel-perfect-enable-no">No</label> <input type="radio" value="no" name="pixel-perfect-enable" id="pixel-perfect-enable-no" />
    </li>
    <li>
      <h3>Designs</h3>
      <input type="text" name="pixel-perfect-url" id="pixel-perfect-url" placeholder="Relative/Absolute Image URL" value="" /> <a href="#" id="btn-add-url">+</a>
      
      <ul id="pixel-perfect-urls"></ul>
    </li>
    <li>
      <h3>Position</h3>
      <p>
        top <input type="text" name="pixel-perfect-top" id="pixel-perfect-top" value="0" />
        left <input type="text" name="pixel-perfect-left" id="pixel-perfect-left" value="0" />
      </p>
    </li>
    <li>
        <h3>Opacity</h3>
        <p><span id="pixel-perfect-opacity-value">50</span>%</p>
        <div id="pixel-perfect-opacity-slider"></div>
    </li>
  </ul>
</div>
 */

/*
Pixel Perfect JS
===============
Helps you code perfect pixel precision
*/
var PixelPerfect = {
    // all our urls will be in there
    urls: [],
    // the active one
    activeUrl: '',
    // path to our css file
    cssPath: '//dl.dropbox.com/u/2369055/pixelperfectjs/_ui/css/main.css',
    //cssPath: '_ui/css/main.css',
    panelHtml: '<div id="pixel-perfect-panel"><h2>Pixel Perfect JS</h2><ul><li><h3>Enable </h3><label for="pixel-perfect-enable-yes">Yes</label><input type="radio" value="yes" name="pixel-perfect-enable" id="pixel-perfect-enable-yes" checked="checked"/><label for="pixel-perfect-enable-no">No</label><input type="radio" value="no" name="pixel-perfect-enable" id="pixel-perfect-enable-no"/></li><li><h3>Designs</h3><input type="text" name="pixel-perfect-url" id="pixel-perfect-url" placeholder="Relative/Absolute Image URL" value="" /><a href="#" id="btn-add-url">+</a><ul id="pixel-perfect-urls"></ul></li><li><h3>Position</h3><p> top <input type="text" name="pixel-perfect-top" id="pixel-perfect-top" value="0"/> left <input type="text" name="pixel-perfect-left" id="pixel-perfect-left" value="0"/></p></li><li><h3>Opacity</h3><p><span id="pixel-perfect-opacity-value">50</span>%</p><div id="pixel-perfect-opacity-slider"></div></li></ul></div>',

    /**
     * Gets everything going
     */
    init: function () {
        // inject the wrapper
        PixelPerfect.injectWrapper();

        // set up opacity slider
        $('#pixel-perfect-opacity-slider').slider({
            "max": 100,
            "value": 50,
            "slide": PixelPerfect.updateOpacity,
            "change": PixelPerfect.updateOpacity
        });

        // make the design image draggable
        $('#pixel-perfect-wrapper').draggable({
            drag: function () {
                // update top and left values when dragging
                $('#pixel-perfect-top').val(parseInt($('#pixel-perfect-wrapper').css('top')));
                $('#pixel-perfect-left').val(parseInt($('#pixel-perfect-wrapper').css('left')));

                // save settings
                PixelPerfect.saveSettings();
            }
        });

        // make the pixel perfect panel draggable
        $('#pixel-perfect-panel').draggable({
            drag: function () {
                // save settings
                PixelPerfect.saveSettings();
            }
        });

        // whenever we add a new image url
        $('#btn-add-url').on('click', function(e){
            e.preventDefault();

            // add url
            PixelPerfect.addUrl();
        });

        // whenver we hit on enter when adding a new url
        $('#pixel-perfect-url').keypress(function (e) {
            if (e.which == 13) {
                // add url
                PixelPerfect.addUrl();
            }
        });

        // when we choose an url in our list
        $(document).on('click', '.btn-choose-url', function(e){
            e.preventDefault();

            // set the active url
            PixelPerfect.activeUrl = $(this).data('url');
            PixelPerfect.loadImage();

            // save settings
            PixelPerfect.saveSettings();
        });

        // when we remove a url from our list
        $(document).on('click', '.btn-remove-url', function(e){
            e.preventDefault();

            // get the url we clicked on
            var url = $(this).data('url');

            // remove url from array
            PixelPerfect.urls = $.grep(PixelPerfect.urls, function(value) {
                return value != url;
            });

            // refresh our list
            PixelPerfect.refreshUrls();

            // save settings
            PixelPerfect.saveSettings();
        })

        // when we enable/disable the plugin
        $("input[type='radio'][name='pixel-perfect-enable']").change(function(){
            // get the value
            var value = $(this).val();
            
            // we don't want to see the design
            if (value == 'no') {
                $('#pixel-perfect-wrapper').hide();

                // hide panel options
                PixelPerfect.hidePanel();
            }
            else {
                $('#pixel-perfect-wrapper').show();

                // show panel options
                PixelPerfect.showPanel();
            }

            // save settings
            PixelPerfect.saveSettings();
        });

        // whenever we hit enter in the top and left text boxes
        $('#pixel-perfect-top, #pixel-perfect-left').keypress(function (e) {
            if (e.which == 13) {
                $('#pixel-perfect-wrapper').css({
                    "left": $('#pixel-perfect-left').val() + 'px',
                    "top": $('#pixel-perfect-top').val() + 'px'
                });

                // save settings
                PixelPerfect.saveSettings();
            }
        });

        // lose focus in the top and left text boxes
        $('#pixel-perfect-top, #pixel-perfect-left').blur(function () {
            $('#pixel-perfect-wrapper').css({
                "left": $('#pixel-perfect-left').val() + 'px',
                "top": $('#pixel-perfect-top').val() + 'px'
            });

            // save settings
            PixelPerfect.saveSettings();
        });

        // upon init, we try to restore settings from the cookie
        PixelPerfect.restoreSettings();
    },

    /**
     * Injects the wrapper in the doc
     *
     * @return void
     */
    injectWrapper: function () {
        // add our css
        $('head').append('<link rel="stylesheet" type="text/css" media="all" href="' + PixelPerfect.cssPath + '" />');

        // build our html
        var html = '<div id="pixel-perfect-wrapper">';
        //html += '<img src="_ui/images/index.jpg" alt="" />';
        html += '</div>';

        // add our panel
        html += PixelPerfect.panelHtml;

        // add to doc
        $('body').append(html);
    },

    /**
     * Updates the opacity of the wrapper
     */
    updateOpacity: function (e, o){
        // update opacity
        $('#pixel-perfect-wrapper').css('opacity', (o.value/100));

        // update text value
        $('#pixel-perfect-opacity-value').text(o.value);

        // save everything
        PixelPerfect.saveSettings();
    },

    /**
     * Save everything in our cookie
     */
    saveSettings: function () {
        // get opacity, left, top, etc values
        var opacity = $('#pixel-perfect-opacity-slider').slider('value');
        var left = $('#pixel-perfect-left').val();
        var top = $('#pixel-perfect-top').val();
        var enabled = $("input[type='radio'][name='pixel-perfect-enable']:checked").val();
        var panelTop = parseInt($('#pixel-perfect-panel').css('top'));
        var panelLeft = parseInt($('#pixel-perfect-panel').css('left'));

        // json 
        var cookieValue = {
            "opacity": opacity, 
            "top": top, 
            "left": left, 
            "panelTop": panelTop, 
            "panelLeft": panelLeft, 
            "enabled": enabled, 
            "urls": PixelPerfect.urls,
            "activeUrl": PixelPerfect.activeUrl
        };

        // save everything as a string
        $.cookie('pixel-perfect', JSON.stringify(cookieValue), {expires: 7});
    },

    /**
     * Restores everything from our cookie
     */
    restoreSettings: function () {
        // get stored values from cookie
        var cookie = $.cookie('pixel-perfect');

        if (cookie != null) {
            // get json string from our cookie
            var storedValues = $.parseJSON(cookie);
            
            // set the top, left and opacity for the wrapper
            $('#pixel-perfect-wrapper').css({
                "left": storedValues.left + 'px',
                "top": storedValues.top + 'px',
                "opacity": (storedValues.opacity/100)
            });

            // set text boxes values
            $('#pixel-perfect-left').val(storedValues.left);
            $('#pixel-perfect-top').val(storedValues.top);

            // set the urls
            PixelPerfect.urls = storedValues.urls;
            PixelPerfect.refreshUrls();

            // set the active url
            PixelPerfect.activeUrl = storedValues.activeUrl;
            $('#pixel-perfect-url-' + $.slug(storedValues.activeUrl) + ' .btn-choose-url').addClass('bold');

            // load the image now
            PixelPerfect.loadImage();

            // whether we enabled the plugin or not
            if (storedValues.enabled == 'no') {
                $('#pixel-perfect-wrapper').hide();
            }

            // set the top and left for the panel
            $('#pixel-perfect-panel').css({
                "left": storedValues.panelLeft + 'px',
                "top": storedValues.panelTop + 'px'
            });

            // set the slider value, called last since it'll save the settings again because of the change event for the slider
            $('#pixel-perfect-opacity-slider').slider('value', storedValues.opacity);
        }
    },

    /**
     * Refresh the URLS list typically after adding/removing a url
     */
    refreshUrls: function () {
        // clear existing
        $('#pixel-perfect-urls').html('');

        // init variables
        var i = 0;
        var totalUrls = PixelPerfect.urls.length;
        var html = '';

        // loop through our urls
        for (i = 0; i< totalUrls; i++) {
            html += '<li id="pixel-perfect-url-' + $.slug(PixelPerfect.urls[i]) + '">[ <a href="#" class="btn-remove-url" data-url="' + PixelPerfect.urls[i] + '">-</a> ] <a href="#" class="btn-choose-url" data-url="' + PixelPerfect.urls[i] + '">' + PixelPerfect.urls[i] + '</a></li>';
        }

        // inject it now
        $('#pixel-perfect-urls').html(html);        
    },

    /**
     * Loads an image in our wrapper
     */
    loadImage: function () {
        if (PixelPerfect.activeUrl.length > 0) {
            var html = '<img src="' + PixelPerfect.activeUrl + '" alt="" />';
            $('#pixel-perfect-wrapper').html(html);

            // remove all bold class and bold the selected one
            $('.btn-choose-url').removeClass('active');
            $('#pixel-perfect-url-' + $.slug(PixelPerfect.activeUrl) + ' .btn-choose-url').addClass('active');
        }
    },

    /**
     * Adds a new url to our list
     */
    addUrl: function () {
        // get url of the image
        var url = $('#pixel-perfect-url').val();
        
        // check if we have entered anything
        if (url.length > 0) {
            // check if image is already present in our list
            if ($.inArray(url, PixelPerfect.urls) == -1) {
                // add to array
                PixelPerfect.urls.push(url);

                // refresh urls list
                PixelPerfect.refreshUrls();

                // set it as the active one
                PixelPerfect.activeUrl = url;

                // load the image now
                PixelPerfect.loadImage();
            }
        }

        // clear text box
        $('#pixel-perfect-url').val('');

        // save settings
        PixelPerfect.saveSettings();
    },

    /**
     * Hides some panel options
     */
    hidePanel: function () {
        $('#pixel-perfect-panel > ul > li').not(':first-child').hide();
    },

    /**
     * Show complete panel options
     */
    showPanel: function () {
        $('#pixel-perfect-panel > ul > li').not(':first-child').show();
    }
};

// get everything going
$(function(){
    PixelPerfect.init();
});