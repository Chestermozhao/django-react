# todo/models.py

from django.db import models
# Create your models here.

# add this
class Todo(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    class Meta:
        db_table = "Todo"

    def __str__(self):
        return self.title

def get_specific_title(**kwargs):
    title = kwargs.get('title')
    if title:
        result = Todo.objects.raw('SELECT * FROM Todo WHERE title = %s', [title])
    else:
        result = Todo.objects.raw('SELECT * FROM Todo')
    return result
