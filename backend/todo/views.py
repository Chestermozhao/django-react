from django.shortcuts import render
from .serializers import TodoSerializer
from .models import Todo
from .models import get_specific_title
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import list_route

class TodoView(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()

    @list_route(methods=['get'])
    def filter_todo(self, request):
        title = request.query_params.get('todo', None)
        title = get_specific_title(title=title)
        serializer = TodoSerializer(title, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
