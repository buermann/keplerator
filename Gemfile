source 'http://rubygems.org'

gem 'rails', '4.1'
gem 'heroku'
gem 'jquery-rails'

# Bundle edge Rails instead:
# gem 'rails',     :git => 'git://github.com/rails/rails.git'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'
  gem 'uglifier'
end

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'
group :production do 
  gem 'pg'
  gem 'thin'
end

#group :development do
#  gem 'mysql'
#end
group :test do
  # Pretty printed test output
  gem 'turn', '~> 0.8.3', :require => false
end
