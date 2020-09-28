import { AvGadget, AvPanel, AvStandardGrabbable, AvTransform, HighlightType, DefaultLanding } from '@aardvarkxr/aardvark-react';
import { EAction, EHand, InitialInterfaceLock, Av } from '@aardvarkxr/aardvark-shared';
import bind from 'bind-decorator';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const k_TestPanelInterface = "test_panel_counter@1";

interface TestPanelState
{
	mood: number;
	grabbableHighlight: HighlightType;
}

interface TestSettings
{
	mood: number;
}

interface TestPanelEvent
{
	type: "set_mood";
	mood?: number;
}

let emojis = [
	'Crown (1F451).svg',
	'Dizzy Face (1F635).svg',
	'Eyes (1F440).svg',
	'Face Savoring Food (1F60B).svg',
	'Face With Tears of Joy (1F602).svg',
	'Fire (1F525).svg',
	'Flexed Biceps (1F4AA).svg',
	'Folded Hands (1F64F).svg',
	'Grimacing Face (1F62C).svg',
	'Hugging Face (1F917).svg',
	'Hundred Points (1F4AF).svg',
	'Kissing Face With Closed Eyes (1F61A).svg',
	'Loudly Crying Face (1F62D).svg',
	'Party Popper (1F389).svg',
	'Pile of Poo (1F4A9).svg',
	'Raising Hands (1F64C).svg',
	'Red Heart (2764).svg',
	'See-No-Evil Monkey (1F648).svg',
	'Smiling Face With Smiling Eyes (1F60A).svg',
	'Smiling Face With Sunglasses (1F60E).svg',
	'Star-Struck (1F929).svg',
	'Thumbs Up (1F44D).svg',
	'Trophy (1F3C6).svg',
	'Unicorn Face (1F984).svg',
	'Winking Face With Tongue (1F61C).svg'
]

class Mood extends React.Component< {}, TestPanelState >
{
	private m_actionListeners: number[];
	private m_grabbableRef = React.createRef<AvStandardGrabbable>();

	constructor( props: any )
	{
		super( props );
		this.state = 
		{ 
			mood: emojis.length - 1,
			grabbableHighlight: HighlightType.None,
		};

		// let moodInterfaceLock: InitialInterfaceLock[] = [];
		// moodInterfaceLock.push( {
		// 	iface: "image-interface@1",
		// 	receiver: null,
		// 	params: 
		// 	{
		// 		imgPath: emojis[this.state.mood],
		// 	}
		// } );
		// AvGadget.instance().startGadget( 'http://localhost:8080', moodInterfaceLock );
	}

	public componentDidMount()
	{
		if( !AvGadget.instance().isRemote )
		{
			this.m_actionListeners = 
			[
				AvGadget.instance().listenForActionStateWithComponent( EHand.Invalid, EAction.A, this ),
				AvGadget.instance().listenForActionStateWithComponent( EHand.Invalid, EAction.B, this ),
				AvGadget.instance().listenForActionStateWithComponent( EHand.Invalid, EAction.Squeeze, this ),
				AvGadget.instance().listenForActionStateWithComponent( EHand.Invalid, EAction.Grab, this ),
				AvGadget.instance().listenForActionStateWithComponent( EHand.Invalid, EAction.Detach, this ),
			];

			AvGadget.instance().registerForSettings( this.onSettingsReceived );
		}
		else
		{
			let params = AvGadget.instance().findInitialInterface( k_TestPanelInterface )?.params as TestSettings;
			this.onSettingsReceived( params );			
		}
	}

	public componentWillUnmount()
	{
		if( !AvGadget.instance().isRemote )
		{
			for( let listener of this.m_actionListeners )
			{
				AvGadget.instance().unlistenForActionState( listener );
			}

			this.m_actionListeners = [];
		}
	}

	public componentDidUpdate()
	{
		if( !AvGadget.instance().isRemote )
		{
			let e: TestPanelEvent = { type: "set_mood", mood: this.state.mood };
			this.m_grabbableRef.current?.sendRemoteEvent( e, true );
		}
	}


	@bind public onSettingsReceived( settings: TestSettings )
	{
		if( settings )
		{
			this.setState( { mood: settings.mood } );
		}
	}

	@bind
	private onRemoteEvent( event: TestPanelEvent )
	{
		switch( event.type )
		{
			case "set_mood":
				if( !AvGadget.instance().isRemote )
				{
					console.log( "Received unexpected set_mood event on master" );
				}
				else
				{
					this.setState( { mood: event.mood } );
				}
				break;		
		}
	}

	public renderActionStateLabel( action: EAction )
	{
		if( AvGadget.instance().getActionStateForHand( EHand.Invalid, action ) )
			return <div className="Label">{ EAction[ action ] }: TRUE</div>;
		else
			return <div className="Label">{ EAction[ action ] }: false</div>;
	}

	public renderRemote()
	{
		return (
			<>
				{ <img className="currentMood" src={'./images/svg/' + emojis[this.state.mood]} /> }
			</>
		);
	}
	
	public renderLocal()
	{
		return <>
				{ emojis.map((e, i) => <img className="emoji" src={'./images/svg/' + e} onMouseUp={() => this.setState({ mood: i })}/>)}
			</>
	}

	public render()
	{
		let sDivClasses:string = "FullPage";

		let remoteInitLocks: InitialInterfaceLock[] = [];

		if( !AvGadget.instance().isRemote )
		{
			remoteInitLocks.push( {
				iface: k_TestPanelInterface,
				receiver: null,
				params: 
				{
					imgPath: this.state.mood,
				}
			} );
		}

		return (
			<div className={ sDivClasses } >
				<div>
					<AvStandardGrabbable modelUri={ "./models/mood-handle.glb" } modelScale={ 0.2 } remoteGadgetCallback={ this.onRemoteEvent }
						useInitialParent={ true } remoteInterfaceLocks={ remoteInitLocks } ref={ this.m_grabbableRef }>
						<AvTransform translateY={ 0.15 } >
							<AvPanel interactive={true} widthInMeters={ 0.25 }/>
						</AvTransform>
					</AvStandardGrabbable>
				</div>
				{ AvGadget.instance().isRemote ? this.renderRemote() : this.renderLocal() }
			</div> );
	}

}

let main = Av() ? <Mood/> : <DefaultLanding/>
ReactDOM.render( main, document.getElementById( "root" ) );
