from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User


class CustomerUserCreationForm(UserCreationForm):

    emial = forms.EmailField(required=True)
    firstname = forms.CharField( max_length=100, required=True)
    lastname = forms.CharField(max_length=100, required = True)
    date_of_birth = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    phone_number = forms.CharField( max_length=15, required=False, help_text = "Please inlcude you country code")

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 
                'password1', 'password2', 'phone_number', 'date_of_birth')


    # def __init__ (self, *arg, **kwarg):

    #     super.__init__(*arg, **kwarg)

    #     for field_name, field in self.fields.items():
    #         field.widget.attrs.update({'class': 'form-input', 'placeholder': field.label})

    #     self.fields['username'].help_text = "Required. Letters, digits, and @/./+/-/_ only."
    #     self.fields['password1'].help_text = "Must be at least 8 characters."

    
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
