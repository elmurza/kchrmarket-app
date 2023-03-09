const moscow = [
    [56.146898, 36.889735],
    [56.278528, 37.521449],
    [56.223482, 38.114711],
    [56.036346, 38.669520],
    [55.823564, 39.059535],
    [55.612715, 38.955165],
    [55.488152, 38.702479],
    [55.388216, 38.482753],
    [55.262939, 38.125697],
    [55.228418, 37.631312],
    [55.269212, 37.219325],
    [55.394470, 36.867762],
    [55.534910, 36.746913],
    [55.839022, 36.702967],
    [56.146898, 36.889735]
]

function inside(gps=[], polygon=[])
{
    const x = gps[0], y = gps[1];

    let isInside = false;
    const length = polygon.length;

    for(let i = 0, j = length - 1; i < length; j = i++)
    {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];
        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
        {
            isInside = !isInside;
        }
    }
    return isInside;
}

export function isInMoscow (lat, lon) {
    return inside([lat, lon], moscow)
}
