Keplerator::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.
   root :to => "home#index"
   match '/about' => "home#about"

   # more like note keeping of the ground we want to cover, which needs to find a better home:
   match 'lexicon/:action' => 'lexicon' # 1000BC
   
   # the Sanskrit tradition
   match 'lagadha/:action' => 'lagadha' # 1000BC
   match 'aryabhata/:action' => 'aryabhata' # 476–550 
   match 'brahmagupta/:action' => 'brahmagupta' # 598–668 
   match 'varahamihira/:action' => 'varahamihira' # 505
   match 'bhaskaraI/:action' => 'bhaskaraI' # 629
   match 'lalla/:action' => 'lalla' # 700s
   match 'bhaskaraII/:action' => 'bhaskaraII'
   match 'sripati/:action' => 'sripati' # 1045
   match 'suri/:action' => 'suri' # mahendra, 1300s
   match 'nilakanthan/:action' => 'nilakanthan' # 1444-1544
   match 'pisarati/:action' => 'pisarati' # 1550-1621 

   # Bruno redux: the Indian scholar Mir Muhammad Hussain had travelled to England in 1774 to study Western science and, on his return to India in 1777, he wrote a Persian treatise on astronomy. He wrote about the heliocentric model, and argued that there exists an infinite number of universes (awalim), each with their own planets and stars.

   # The Greek tradition, According to a story reported by Simplicius, Plato posed a question for Greek astronomers: "By the assumption of what uniform and orderly motions can the apparent motions of the planets be accounted for?" 

   match 'heracleides/:action' => 'heracleides' # 390BC, Turkey.  Some say he had mercury and venus orbit the sun, outer planets around the earth; the earth rotates, per Aryabhata, and according to Simplicius proposed the Sun was static and the Earth moved.  C.f. http://adsabs.harvard.edu/full/1992JHA....23..233E
   match 'capella/:action' => 'capella' # 400s CE, Martianus Capella, definitely proposed inner planets orbit the sun, http://en.wikipedia.org/wiki/File:Naboth_Capella.JPG

   match 'eudoxus/:action' => 'eudoxus' # 380bc, Eygpt
   match 'aristotle/:action' => 'aristotle'

   # Greco-Roman Egyptian, 168AD
   match 'ptolemy/:action' => 'ptolemy'

   # The Arabic tradition
   # The Maragheh School, northwest Iran, 13th century.
   match 'urdi/:action' => 'urdi'
   match 'tusi/:action' => 'tusi'
   # Muwaqqit, the Umayyad Mosque in Damascus, Syria, 14th century
   match 'shatir/:action' => 'shatir'

   # The Latin tradition, early modern Europeans
   match 'copernicus/:action' => 'copernicus'
   match 'tycho/:action'      => 'tycho'
   match 'gilbert/:action'    => 'gilbert' # william
   # http://books.google.com/books?id=hMgXh8jMSGgC&pg=PA29
   match 'roslin/:action'     => 'roslin' # helisaeus roslin
   match 'rothmann/:action'    => 'rothmann' # christoph rothmann
   match 'ursus/:action'      => 'ursus' # Nicholas Reymers Bär aka Ursus, see also, John Craig and Helisaeus Roeslin
   match 'kepler/:action' => 'kepler'


  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
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
  match ':controller(/:action(/:id(.:format)))'
end
