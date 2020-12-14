from django.shortcuts import render, get_object_or_404
from .models import Book, Author, BookInstances, Genre
from django.http import HttpResponseRedirect
from django.urls import reverse
import datetime


def index(request):
    """
    Функция отображения для домашней страницы сайта.
    """
    #  Генерация "количеств" некоторых главных объектов
    num_books = Book.objects.all().count()
    num_instances = BookInstances.objects.all().count()
    #  Доступные книги (статус = 'a')
    num_instances_available = BookInstances.objects.filter(status__exact='a').count()
    num_authors = Author.objects.count()  # Метод 'all' применен по умолчанию
    num_genre = Genre.objects.all().count()
    # Number of visits to this view, as counted in the session variable.
    num_visits = request.session.get('num_visits', 0)
    request.session['num_visits'] = num_visits + 1

    #  Отрисовка HTML шаблона index.html с данными внутри
    #  переменной контекста context
    return render(
        request,
        'index.html',
        context={'num_books': num_books, 'num_instances': num_instances,
                 'num_instances_available': num_instances_available, 'num_authors': num_authors, 'num_genre': num_genre,
                 'num_visits': num_visits}
    )


from django.views import generic


class BookListView(generic.ListView):
    model = Book
    paginate_by = 10

    def get_queryset(self):
        return Book.objects.all()  # return Book.objects.filter(title__icontains='python')[:5]  # Получение 5 книг, содержащих слово "python" в
        # заголовке

    def get_context_data(self, **kwargs):
        context = super(BookListView, self).get_context_data(
            **kwargs)  # В первую очередь получаем базовую реализацию контекста
        context[
            'some_data'] = 'This is just some data'  # Добавляем новую переменную к контексту и инициализаруем ее некоторым значением
        return context


class BookDetailView(generic.DetailView):
    model = Book


class AuthorListView(generic.ListView):
    model = Author
    paginate_by = 10

    def get_queryset(self):
        return Author.objects.all()  # Получения списка всех авторов
        # заголовке

    def get_context_data(self, **kwargs):
        context = super(AuthorListView, self).get_context_data(
            **kwargs)  # В первую очередь получаем базовую реализацию контекста
        context[
            'some_data'] = 'This is just some data'  # Добавляем новую переменную к контексту и инициализаруем ее некоторым значением
        return context


class AuthorDetailView(generic.DetailView):
    model = Author
    extra_context = {'books': Book.objects.all().order_by('title')}


from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin


class LoanedBooksByUserListView(LoginRequiredMixin, generic.ListView):
    """
    Generic class-based view listing books on loan to current user.
    """
    model = BookInstances
    template_name = 'catalog/bookinstance_list_borrowed_user.html'
    paginate_by = 10

    def get_queryset(self):
        return BookInstances.objects.filter(borrower=self.request.user).filter(status__exact='o').order_by('due_back')


class AllBorrowedBooksListView(LoginRequiredMixin, generic.ListView):
    model = BookInstances
    template_name = 'catalog/bookinstance_list_all_borrowed.html'
    #paginate_by = 10

    def get_queryset(self):
        return BookInstances.objects.all().order_by('due_back')


from .forms import RenewBookForm
from django.contrib.auth.decorators import permission_required


@permission_required('catalog.can_mark_returned')
def renew_book_librarian(request, pk):
    book_inst = get_object_or_404(BookInstances, pk=pk)

    # Если данный запрос типа POST, тогда
    if request.method == 'POST':
        form = RenewBookForm(
            request.POST)  # Создаем экземпляр формы и заполняем данными из запроса (связывание, binding)
        if form.is_valid():  # Проверка валидности данных формы
            book_inst.due_back = form.cleaned_data[
                'renewal_date']  # Обработка данных из form.cleaned_data, здесь мы просто присваиваем их поля due_back
            book_inst.save()

            return HttpResponseRedirect(reverse('all-borrowed'))  # Переход по адресу 'all-borrowed'
    # Если это GET - создать форму по умолчанию
    else:
        proposed_renewal_date = datetime.date.today() + datetime.timedelta(weeks=3)
        form = RenewBookForm(initial={'renewal_date': proposed_renewal_date, })

    return render(request, 'catalog/book_renew_librarian.html', {'form': form, 'bookinst': book_inst})


from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Author


class AuthorCreate(PermissionRequiredMixin, CreateView):
    model = Author
    permission_required = 'catalog.can_set_author'
    fields = '__all__'
    initial = {'date_of_death': '01/01/2020', }


class AuthorUpdate(PermissionRequiredMixin, UpdateView):
    model = Author
    permission_required = 'catalog.can_set_author'
    fields = ['first_name', 'last_name', 'date_of_birth', 'date_of_death']


class AuthorDelete(PermissionRequiredMixin, DeleteView):
    model = Author
    permission_required = 'catalog.can_set_author'
    success_url = reverse_lazy('authors')


class BookCreate(PermissionRequiredMixin, CreateView):
    model = Book
    permission_required = 'catalog.can_set_book'
    fields = '__all__'


class BookUpdate(PermissionRequiredMixin, UpdateView):
    model = Book
    permission_required = 'catalog.can_set_book'
    fields = '__all__'


class BookDelete(PermissionRequiredMixin, DeleteView):
    model = Book
    permission_required = 'catalog.can_set_book'
    success_url = reverse_lazy('books')


from django.views.generic.edit import FormView
from django.contrib.auth.forms import UserCreationForm


class RegisterFormView(FormView):
    form_class = UserCreationForm

    success_url = "/"

    template_name = "registration_user.html"

    def form_valid(self, form):
        form.save()

        return super(RegisterFormView, self).form_valid(form)