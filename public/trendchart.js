function deleteEntity(id, pathString) {
    $.ajax({
        url: pathString + id,
        type: 'DELETE',
        success: function (result) {
            window.location.reload(true);
        }
    })
};