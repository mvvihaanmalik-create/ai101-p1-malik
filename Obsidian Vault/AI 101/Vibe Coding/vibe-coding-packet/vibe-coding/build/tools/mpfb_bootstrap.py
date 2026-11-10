"""Load the official MPFB source for this headless process only.
No user Blender preferences are installed or saved; caches stay in the project.
"""
import bpy, sys
from pathlib import Path
BUILD=Path(__file__).resolve().parents[1]
original_user_resource=bpy.utils.user_resource
def project_user_resource(kind,*,path='',create=False):
    p=BUILD/'tools/vendor/mpfb-state'/kind.lower()/path
    if create:p.mkdir(parents=True,exist_ok=True)
    return str(p)
bpy.utils.user_resource=project_user_resource
sys.path.insert(0,str(BUILD/'tools/vendor/mpfb2/src'))
original_extension_path=bpy.utils.extension_path_user
def project_extension_path(package,*args,**kwargs):
    if package=='mpfb':
        p=BUILD/'tools/vendor/mpfb-state';p.mkdir(parents=True,exist_ok=True);return str(p)
    return original_extension_path(package,*args,**kwargs)
bpy.utils.extension_path_user=project_extension_path
import mpfb
original_get_preference=mpfb.get_preference
def project_preference(name):
    if name=='mpfb_user_data':return str(BUILD/'tools/vendor/mpfb-state')
    if name=='mh_auto_user_data':return False
    return original_get_preference(name)
mpfb.get_preference=project_preference
if 'mpfb' not in bpy.context.preferences.addons:
    addon=bpy.context.preferences.addons.new();addon.module='mpfb'
mpfb.register()
from mpfb.services.humanservice import HumanService
from mpfb.services.targetservice import TargetService
from mpfb.services.exportservice import ExportService
from mpfb.services.objectservice import ObjectService
from mpfb.services.locationservice import LocationService
from mpfb.entities.objectproperties import HumanObjectProperties
if '--probe' in sys.argv:
    body=HumanService.create_human(scale=.1,feet_on_ground=True)
    HumanObjectProperties.set_value('gender',1,entity_reference=body)
    HumanObjectProperties.set_value('age',.85,entity_reference=body)
    TargetService.reapply_macro_details(body)
    rig=HumanService.add_builtin_rig(body,'game_engine')
    print('MPFB_READY',len(body.data.vertices),body.dimensions[:],[(b.name,list(b.head_local),list(b.tail_local)) for b in rig.data.bones])
