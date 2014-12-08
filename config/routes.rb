Keplerator::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.
   root :to => "lexicon#deferent"
   get '/about' => "home#about"

   # more like note keeping of the ground we want to cover, which needs to find a better home:
   get 'lexicon/:action' => 'lexicon' # 1000BC
   
   # the Sanskrit tradition
   get 'lagadha/:action' => 'lagadha' # 1000BC
   get 'aryabhata/:action' => 'aryabhata' # 476–550 
   get 'brahmagupta/:action' => 'brahmagupta' # 598–668 
   get 'varahamihira/:action' => 'varahamihira' # 505
   get 'lalla/:action' => 'lalla' # 700s
   #get 'bhaskaraI/:action' => 'bhaskaraI' # 629
   #get 'bhaskaraII/:action' => 'bhaskaraII'
   get 'sripati/:action' => 'sripati' # 1045
   get 'suri/:action' => 'suri' # mahendra, 1300s
   get 'nilakanthan/:action' => 'nilakanthan' # 1444-1544
   get 'pisarati/:action' => 'pisarati' # 1550-1621 

   # Bruno redux: the Indian scholar Mir Muhammad Hussain had travelled to England in 1774 to study Western science and, on his return to India in 1777, he wrote a Persian treatise on astronomy. He wrote about the heliocentric model, and argued that there exists an infinite number of universes (awalim), each with their own planets and stars.

   # The Greek tradition, According to a story reported by Simplicius, Plato posed a question for Greek astronomers: "By the assumption of what uniform and orderly motions can the apparent motions of the planets be accounted for?" 

   get 'heracleides/:action' => 'heracleides' # 390BC, Turkey.  Some say he had mercury and venus orbit the sun, outer planets around the earth; the earth rotates, per Aryabhata, and according to Simplicius proposed the Sun was static and the Earth moved.  C.f. http://adsabs.harvard.edu/full/1992JHA....23..233E
   get 'capella/:action' => 'capella' # 400s CE, Martianus Capella, definitely proposed inner planets orbit the sun, http://en.wikipedia.org/wiki/File:Naboth_Capella.JPG

   get 'eudoxus/:action' => 'eudoxus' # 380bc, Eygpt
   get 'aristotle/:action' => 'aristotle'

   # Greco-Roman Egyptian, 168AD
   get 'ptolemy/:action' => 'ptolemy'

   # The Arabic tradition
   # The Maragheh School, northwest Iran, 13th century.
   get 'urdi/:action' => 'urdi'
   get 'tusi/:action' => 'tusi'
   # Muwaqqit, the Umayyad Mosque in Damascus, Syria, 14th century
   get 'shatir/:action' => 'shatir'

   # The Latin tradition, early modern Europeans
   get 'copernicus/:action' => 'copernicus'
   get 'tycho/:action'      => 'tycho'
   get 'gilbert/:action'    => 'gilbert' # william
   # http://books.google.com/books?id=hMgXh8jMSGgC&pg=PA29
   get 'roslin/:action'     => 'roslin' # helisaeus roslin
   get 'rothmann/:action'    => 'rothmann' # christoph rothmann
   get 'ursus/:action'      => 'ursus' # Nicholas Reymers Bär aka Ursus, see also, John Craig and Helisaeus Roeslin
   get 'kepler/:action' => 'kepler'


  # Sample of regular route:
  #   get 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   get 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  get ':controller(/:action(/:id(.:format)))'
end
