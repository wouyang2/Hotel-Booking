from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User
from django.contrib.auth.forms import AuthenticationForm


class CustomerUserCreationForm(UserCreationForm):

    # email = forms.EmailField(required=True)
    # first_name = forms.CharField( max_length=100, required=True)
    # last_name = forms.CharField(max_length=100, required = True)
    date_of_birth = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    phone_number = forms.CharField( max_length=15, required=False, help_text = "Please inlcude you country code")

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 
                  'username', 'password1', 'password2', 'phone_number', 'date_of_birth')
        
        widgets = {
           'username' : forms.TextInput(attrs={'class': 'form-input', 'placeholder':'username'}),
           'first_name' : forms.TextInput(attrs={'class': 'form-input'}),
           'last_name' : forms.TextInput(attrs={'class': 'form-input'}),
           'password1' : forms.PasswordInput(attrs={'class': 'form-input password1'}),
           'password2' : forms.PasswordInput(attrs={'class': 'form-input password2'}),
           'email' : forms.EmailInput(attrs={'class': 'form-input'}),
           'phone_number' : forms.TextInput(attrs={'class': 'form-input', 'placeholder':'phone'}),   
       }

    def __init__ (self, *arg, **kwargs):

        super().__init__(*arg, **kwargs)

        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-input', 'placeholder': field.label})

    
    # Make Unique Email Since Django User do not enforece unique email
    def clean_email(self):
        email = self.cleaned_data.get('email')

        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email already exists.")

        return email


    def save(self, commit=True):
        user = super().save(commit)
        user.email = self.cleaned_data['email']

        user.save()

        # Save extra fields to Profile
        user.profile.phone_number = self.cleaned_data.get('phone_number')
        user.profile.date_of_birth = self.cleaned_data.get('date_of_birth')
        user.profile.save()

        return user


"""Login Form"""
class CustomLoginForm(AuthenticationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].widget.attrs.update({
            'placeholder': 'Enter username',
            'class': 'login-input'
        })

        self.fields['password'].widget.attrs.update({
            'placeholder': 'Password',
            'class': 'login-input'
        })