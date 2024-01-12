import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

			let camera, scene, renderer, stats;

			const clock = new THREE.Clock();

			let mixer;
			let lum1 = 1;
			let lum2 = -1;
			let wait = 0;
			let hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );
			let dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
			let lumjour = new THREE.SpotLight( 0xffffff, 15, 0, Math.PI/5, 0, 0 );
			let turnup1 = new THREE.DirectionalLight( "rgb(20 , 60, 220)", 10 );
			let turnup2 = new THREE.DirectionalLight( "rgb(100, 180, 20)", 10 );
			let pointerPosition = { x: 0, y: 0 };
			const raycaster_oui = new THREE.Raycaster();
			const raycaster_non = new THREE.Raycaster();

			let system = -1;

			let geo_bouton_oui = new THREE.CylinderGeometry(5, 5, 5, 16);
			const mat_bouton_oui = new THREE.MeshPhysicalMaterial( { color: "rgb(0, 150, 0)" } ); 
			const bouton_oui = new THREE.Mesh( geo_bouton_oui, mat_bouton_oui ); 

			let geo_bouton_non = new THREE.CylinderGeometry(5, 5, 5, 16);
			const mat_bouton_non = new THREE.MeshPhysicalMaterial( { color: "rgb(150, 0, 0)" } ); 
			const bouton_non = new THREE.Mesh( geo_bouton_non, mat_bouton_non ); 
			


			init();
			animate();

			function init() {

				const container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set( 100, 200, 300 );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xa0a0a0 );
				scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );


				//Support boutons
				let geo_support = new THREE.BoxGeometry(40, 100, 20, 16);
				const mat_support = new THREE.MeshPhysicalMaterial( { color: 0x000000 } ); 
				const support = new THREE.Mesh( geo_support, mat_support ); 
				scene.add( support );
				support.position.set(0 , 50, 140);

				//Boutons
				scene.add( bouton_oui );
				bouton_oui.position.set(-10 , 102, 140);
				scene.add( bouton_non );
				bouton_non.position.set(10 , 102, 140);

				//LUMIERES
				
				hemiLight.position.set( 0, 200, 0 );
				scene.add( hemiLight );

				
				dirLight.position.set( 0, 200, 100 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 180;
				dirLight.shadow.camera.bottom = - 100;
				dirLight.shadow.camera.left = - 120;
				dirLight.shadow.camera.right = 120;
				scene.add( dirLight );
				
				lumjour.position.set( 0, 300, 0 );
				lumjour.castShadow = true;
				lumjour.shadow.camera.top = 180;
				lumjour.shadow.camera.bottom = - 100;
				lumjour.shadow.camera.left = - 120;
				lumjour.shadow.camera.right = 120;
				
				
				turnup1.position.set( 100, 200, 0 );
				turnup1.castShadow = true;
				turnup1.shadow.camera.top = 180;
				turnup1.shadow.camera.bottom = - 100;
				turnup1.shadow.camera.left = - 120;
				turnup1.shadow.camera.right = 120;	
				

				
				turnup2.position.set( -100, 200, 0 );
				turnup2.castShadow = true;
				turnup2.shadow.camera.top = 180;
				turnup2.shadow.camera.bottom = - 100;
				turnup2.shadow.camera.left = - 120;
				turnup2.shadow.camera.right = 120;	
				

				// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

				// ground
				const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
				mesh.rotation.x = - Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add( mesh );

				const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
				grid.material.opacity = 0.2;
				grid.material.transparent = true;
				scene.add( grid );

				// model
				const loader = new FBXLoader();
				loader.load( 'Samba Dancing.fbx', function ( object ) {

					mixer = new THREE.AnimationMixer( object );

					const action = mixer.clipAction( object.animations[ 0 ] );
					action.play();

					object.traverse( function ( child ) {

						if ( child.isMesh ) {

							child.castShadow = true;
							child.receiveShadow = true;

						}

					} );

					scene.add( object );
					turnup1.target = object;
					turnup2.target = object;
					lumjour.target = object;
				} );


				const canvas = document.getElementById("canvas")	
				renderer = new THREE.WebGLRenderer( { antialias: true , canvas : canvas } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
				container.appendChild( renderer.domElement );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.target.set( 0, 100, 0 );
				controls.update();

				window.addEventListener( 'resize', onWindowResize );

				// stats
				stats = new Stats();
				container.appendChild( stats.dom );

				window.addEventListener('pointermove', (event) => {
					pointerPosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
					pointerPosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				});

				window.addEventListener('pointerdown', (event) => {
					console.log(`The user pressed the pointer at ${event.clientX}, ${event.clientY}`);
					
					raycaster_oui.setFromCamera(pointerPosition, camera);
					const intersects_oui = raycaster_oui.intersectObject(bouton_oui, true);
					if (intersects_oui.length > 0) {
					console.log('The ray intersects the object', intersects_oui[0]);
					system = 1;
					bouton_oui.position.set(-10 , 100, 140);
					bouton_non.position.set(10 , 102, 140);
					} 

					raycaster_non.setFromCamera(pointerPosition, camera);
					const intersects_non = raycaster_non.intersectObject(bouton_non, true);
					if (intersects_non.length > 0) {
					console.log('The ray intersects the object', intersects_non[0]);
					system = 0;
					bouton_non.position.set(10 , 100, 140);
					bouton_oui.position.set(-10 , 102, 140);
					}
				});
			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}
			

			//
			function turnup() {
				lumjour.visible = false;
				if(wait>30){
					lum1 = -lum1;
					lum2 = -lum2;
					wait=0;
					dirLight.visible = false;
				}

				if(lum1 > 0){
					scene.add( turnup1 );
					turnup1.visible = true;
				}
				if(lum1 < 0){
					turnup1.visible = false;
				}
				if(lum2 > 0){
					scene.add( turnup2 );
					turnup2.visible = true;
				}
				if(lum2 < 0){
					turnup2.visible = false;
				}
				wait++;
			}

			function turnoff() {
				turnup1.visible = false;
				turnup2.visible = false;
				scene.add( lumjour );
				lumjour.visible = true;
			}

			function animate() {

				requestAnimationFrame( animate );

				const delta = clock.getDelta();

				
				
				if (system == 1){
					if ( mixer ) mixer.update( delta );
					turnup();
				}

				if (system == 0){
					turnoff();
				}
				
				//if ( mixer ) mixer.update( delta - 0.014 );

				renderer.render( scene, camera );

				

				stats.update();
				
			}