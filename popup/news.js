host = 'http://kolcovo.ru';
hostNewsUrl = '/content/news/';

function showMessage(text) {
    $('#news').html('<p>'+ text +'</p>');
}

function hidePopup(delay) {
    delay = delay || 500;

    setTimeout(function () {
        window.close();
    }, delay);
}

function renderNewsTo(responseText, newsContainer) {
    newsContainer.empty();

    var newsRegExp = /<span[^>]*news-date-time"[^>]*>([^<]+)<\/span>[^a]+<a[^<]+<[^<]+<[^<]+<\/a>/gmi;
    var imagesRegExp = /preview_picture[^>]+src=".+?"/gmi;
    var dateRegExp = />((\d+)\s[^\d]+)\s\d+</i; // Matches ">((23) Сентября) 2016<"
    var imageSrcRegExp = /src="(.+?)"/;
    var news = responseText.match(newsRegExp);
    var images = responseText.match(imagesRegExp);
    var prevDate;
    var today = new Date();
    var noNewsForToday = news[0].match(dateRegExp)[2] != today.getDate();
    var todayText = 'Сегодня';
    var noNewsText = 'Нет новостей';

    if (noNewsForToday) {
        newsContainer.append($('<h4>' + todayText + '</h4><div>'+ noNewsText +'</div>'));
    }

    $.each(news, function (i, newsItem) {
        var date = newsItem.match(dateRegExp);
        var showDate;

        // Group news by date
        if (date[1] !== prevDate) {
            showDate = date[2] == today.getDate() ? todayText : date[1];
            newsContainer.append($('<h4>' + showDate + '</h4>'));
            prevDate = date[1];
        }

        // Create div with background image
        var image = '';
        if (images && images[i] && images[i].match(imageSrcRegExp)) {
            var src = host + images[i].match(imageSrcRegExp)[1];
            image = '<div class="image" style="background-image: url('+ src +');"></div> ';
        }

        newsContainer.append($('<div>' + image + newsItem + '</div>'));
    });

    newsContainer.find('a').each(function () {
        var $this = $(this);
        var href = $this.attr('href');
        $this
            .attr('href', host + href)
            .attr('target', '_blank')
        ;
    });
}

function showNews() {
    $
        .get(host + hostNewsUrl, function (data) {
            renderNewsTo(data, $('#news'));

            $('a').click(function () {
                hidePopup();
            });
        })
        .fail(function () {
            showMessage('Не удалось получить новости');
        })
        .always(function () {
            //
        });
}


$(function () {
    showNews();
});
